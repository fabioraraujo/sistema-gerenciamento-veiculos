import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import {
  createVehicle,
  deleteVehicle,
  getDistinctMarcas,
  getDistinctModelos,
  getVehicleById,
  getVehicleByPlaca,
  getVehicles,
  updateVehicle,
} from "../db/queries";

// Validation schemas
const vehicleStatusSchema = z.enum(["ativo", "inativo"]);

const createVehicleSchema = z.object({
  placa: z
    .string()
    .min(7, "Placa deve ter no mínimo 7 caracteres")
    .max(10, "Placa deve ter no máximo 10 caracteres")
    .transform((val) => val.toUpperCase()),
  marca: z
    .string()
    .min(1, "Marca é obrigatória")
    .max(100, "Marca deve ter no máximo 100 caracteres"),
  modelo: z
    .string()
    .min(1, "Modelo é obrigatório")
    .max(100, "Modelo deve ter no máximo 100 caracteres"),
  ano: z
    .number()
    .int("Ano deve ser um número inteiro")
    .min(1900, "Ano deve ser maior que 1900")
    .max(new Date().getFullYear() + 1, "Ano não pode ser maior que o próximo ano"),
  cor: z
    .string()
    .min(1, "Cor é obrigatória")
    .max(50, "Cor deve ter no máximo 50 caracteres"),
  status: vehicleStatusSchema.default("ativo"),
});

const updateVehicleSchema = z.object({
  id: z.number().int().positive(),
  placa: z
    .string()
    .min(7, "Placa deve ter no mínimo 7 caracteres")
    .max(10, "Placa deve ter no máximo 10 caracteres")
    .transform((val) => val.toUpperCase())
    .optional(),
  marca: z
    .string()
    .min(1, "Marca é obrigatória")
    .max(100, "Marca deve ter no máximo 100 caracteres")
    .optional(),
  modelo: z
    .string()
    .min(1, "Modelo é obrigatório")
    .max(100, "Modelo deve ter no máximo 100 caracteres")
    .optional(),
  ano: z
    .number()
    .int("Ano deve ser um número inteiro")
    .min(1900, "Ano deve ser maior que 1900")
    .max(new Date().getFullYear() + 1, "Ano não pode ser maior que o próximo ano")
    .optional(),
  cor: z
    .string()
    .min(1, "Cor é obrigatória")
    .max(50, "Cor deve ter no máximo 50 caracteres")
    .optional(),
  status: vehicleStatusSchema.optional(),
});

const listVehiclesSchema = z.object({
  marca: z.string().optional(),
  modelo: z.string().optional(),
  status: vehicleStatusSchema.optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
});

export const vehiclesRouter = router({
  // List vehicles with filters and pagination
  list: publicProcedure.input(listVehiclesSchema).query(async ({ input }) => {
    return getVehicles({
      marca: input.marca,
      modelo: input.modelo,
      status: input.status,
      page: input.page,
      pageSize: input.pageSize,
    });
  }),

  // Get single vehicle by ID
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const vehicle = await getVehicleById(input.id);
      if (!vehicle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Veículo não encontrado",
        });
      }
      return vehicle;
    }),

  // Create new vehicle
  create: publicProcedure.input(createVehicleSchema).mutation(async ({ input }) => {
    // Check if placa already exists
    const existing = await getVehicleByPlaca(input.placa);
    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Já existe um veículo cadastrado com esta placa",
      });
    }

    return createVehicle(input);
  }),

  // Update vehicle
  update: publicProcedure.input(updateVehicleSchema).mutation(async ({ input }) => {
    const { id, ...data } = input;

    // Check if vehicle exists
    const existing = await getVehicleById(id);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Veículo não encontrado",
      });
    }

    // If updating placa, check if it's already in use by another vehicle
    if (data.placa && data.placa !== existing.placa) {
      const placaExists = await getVehicleByPlaca(data.placa);
      if (placaExists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe um veículo cadastrado com esta placa",
        });
      }
    }

    const updated = await updateVehicle(id, data);
    if (!updated) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao atualizar veículo",
      });
    }

    return updated;
  }),

  // Delete vehicle
  delete: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const deleted = await deleteVehicle(input.id);
      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Veículo não encontrado",
        });
      }
      return { success: true };
    }),

  // Get distinct marcas for filter dropdown
  getMarcas: publicProcedure.query(async () => {
    return getDistinctMarcas();
  }),

  // Get distinct modelos for filter dropdown (optionally filtered by marca)
  getModelos: publicProcedure
    .input(z.object({ marca: z.string().optional() }))
    .query(async ({ input }) => {
      return getDistinctModelos(input.marca);
    }),
});
