import type { Express } from "express";
import swaggerUi from "swagger-ui-express";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "API de Gerenciamento de Veículos",
    version: "1.0.0",
    description: "API para gerenciamento de frota de veículos com operações CRUD completas.",
    contact: {
      name: "Suporte",
      email: "suporte@veiculos.com",
    },
  },
  servers: [
    {
      url: "/api",
      description: "Servidor de API",
    },
  ],
  tags: [
    {
      name: "Veículos",
      description: "Operações de gerenciamento de veículos",
    },
  ],
  paths: {
    "/trpc/vehicles.list": {
      get: {
        tags: ["Veículos"],
        summary: "Listar veículos",
        description: "Retorna uma lista paginada de veículos com filtros opcionais",
        parameters: [
          { name: "marca", in: "query", schema: { type: "string" }, description: "Filtrar por marca" },
          { name: "modelo", in: "query", schema: { type: "string" }, description: "Filtrar por modelo" },
          { name: "status", in: "query", schema: { type: "string", enum: ["ativo", "inativo"] }, description: "Filtrar por status" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Número da página" },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 10 }, description: "Itens por página" },
        ],
        responses: {
          "200": {
            description: "Lista de veículos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Vehicle" } },
                    total: { type: "integer" },
                    page: { type: "integer" },
                    pageSize: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/trpc/vehicles.create": {
      post: {
        tags: ["Veículos"],
        summary: "Criar veículo",
        description: "Cadastra um novo veículo no sistema",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateVehicle" },
            },
          },
        },
        responses: {
          "200": {
            description: "Veículo criado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Vehicle" },
              },
            },
          },
          "409": { description: "Placa já cadastrada" },
        },
      },
    },
    "/trpc/vehicles.update": {
      post: {
        tags: ["Veículos"],
        summary: "Atualizar veículo",
        description: "Atualiza os dados de um veículo existente",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateVehicle" },
            },
          },
        },
        responses: {
          "200": {
            description: "Veículo atualizado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Vehicle" },
              },
            },
          },
          "404": { description: "Veículo não encontrado" },
          "409": { description: "Placa já cadastrada" },
        },
      },
    },
    "/trpc/vehicles.delete": {
      post: {
        tags: ["Veículos"],
        summary: "Excluir veículo",
        description: "Remove um veículo do sistema",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { id: { type: "integer" } },
                required: ["id"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Veículo excluído com sucesso" },
          "404": { description: "Veículo não encontrado" },
        },
      },
    },
  },
  components: {
    schemas: {
      Vehicle: {
        type: "object",
        properties: {
          id: { type: "integer", description: "ID único do veículo" },
          placa: { type: "string", description: "Placa do veículo" },
          marca: { type: "string", description: "Marca do veículo" },
          modelo: { type: "string", description: "Modelo do veículo" },
          ano: { type: "integer", description: "Ano de fabricação" },
          cor: { type: "string", description: "Cor do veículo" },
          status: { type: "string", enum: ["ativo", "inativo"], description: "Status do veículo" },
          createdAt: { type: "string", format: "date-time", description: "Data de criação" },
          updatedAt: { type: "string", format: "date-time", description: "Data de atualização" },
        },
      },
      CreateVehicle: {
        type: "object",
        required: ["placa", "marca", "modelo", "ano", "cor"],
        properties: {
          placa: { type: "string", minLength: 7, maxLength: 10, description: "Placa do veículo" },
          marca: { type: "string", minLength: 1, maxLength: 100, description: "Marca do veículo" },
          modelo: { type: "string", minLength: 1, maxLength: 100, description: "Modelo do veículo" },
          ano: { type: "integer", minimum: 1900, description: "Ano de fabricação" },
          cor: { type: "string", minLength: 1, maxLength: 50, description: "Cor do veículo" },
          status: { type: "string", enum: ["ativo", "inativo"], default: "ativo", description: "Status do veículo" },
        },
      },
      UpdateVehicle: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "integer", description: "ID do veículo" },
          placa: { type: "string", minLength: 7, maxLength: 10, description: "Placa do veículo" },
          marca: { type: "string", minLength: 1, maxLength: 100, description: "Marca do veículo" },
          modelo: { type: "string", minLength: 1, maxLength: 100, description: "Modelo do veículo" },
          ano: { type: "integer", minimum: 1900, description: "Ano de fabricação" },
          cor: { type: "string", minLength: 1, maxLength: 50, description: "Cor do veículo" },
          status: { type: "string", enum: ["ativo", "inativo"], description: "Status do veículo" },
        },
      },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get("/api/docs.json", (_req, res) => {
    res.json(swaggerDocument);
  });
}
