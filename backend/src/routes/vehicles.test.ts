import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

// Test validation schemas
describe("Vehicle Validation Schemas", () => {
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

  describe("createVehicleSchema", () => {
    it("should validate a valid vehicle", () => {
      const validVehicle = {
        placa: "ABC1234",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2023,
        cor: "Prata",
        status: "ativo" as const,
      };

      const result = createVehicleSchema.safeParse(validVehicle);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.placa).toBe("ABC1234");
      }
    });

    it("should transform placa to uppercase", () => {
      const vehicle = {
        placa: "abc1234",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2023,
        cor: "Prata",
      };

      const result = createVehicleSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.placa).toBe("ABC1234");
      }
    });

    it("should reject placa with less than 7 characters", () => {
      const vehicle = {
        placa: "ABC123",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2023,
        cor: "Prata",
      };

      const result = createVehicleSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it("should reject empty marca", () => {
      const vehicle = {
        placa: "ABC1234",
        marca: "",
        modelo: "Corolla",
        ano: 2023,
        cor: "Prata",
      };

      const result = createVehicleSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it("should reject ano before 1900", () => {
      const vehicle = {
        placa: "ABC1234",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 1899,
        cor: "Prata",
      };

      const result = createVehicleSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it("should reject ano in the far future", () => {
      const vehicle = {
        placa: "ABC1234",
        marca: "Toyota",
        modelo: "Corolla",
        ano: new Date().getFullYear() + 2,
        cor: "Prata",
      };

      const result = createVehicleSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });

    it("should default status to ativo", () => {
      const vehicle = {
        placa: "ABC1234",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2023,
        cor: "Prata",
      };

      const result = createVehicleSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("ativo");
      }
    });

    it("should accept status inativo", () => {
      const vehicle = {
        placa: "ABC1234",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2023,
        cor: "Prata",
        status: "inativo" as const,
      };

      const result = createVehicleSchema.safeParse(vehicle);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("inativo");
      }
    });

    it("should reject invalid status", () => {
      const vehicle = {
        placa: "ABC1234",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2023,
        cor: "Prata",
        status: "pendente",
      };

      const result = createVehicleSchema.safeParse(vehicle);
      expect(result.success).toBe(false);
    });
  });

  describe("listVehiclesSchema", () => {
    const listVehiclesSchema = z.object({
      marca: z.string().optional(),
      modelo: z.string().optional(),
      status: vehicleStatusSchema.optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(10),
    });

    it("should accept empty filters", () => {
      const result = listVehiclesSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(10);
      }
    });

    it("should accept valid filters", () => {
      const filters = {
        marca: "Toyota",
        modelo: "Corolla",
        status: "ativo" as const,
        page: 2,
        pageSize: 20,
      };

      const result = listVehiclesSchema.safeParse(filters);
      expect(result.success).toBe(true);
    });

    it("should reject pageSize greater than 100", () => {
      const filters = {
        pageSize: 101,
      };

      const result = listVehiclesSchema.safeParse(filters);
      expect(result.success).toBe(false);
    });

    it("should reject negative page", () => {
      const filters = {
        page: -1,
      };

      const result = listVehiclesSchema.safeParse(filters);
      expect(result.success).toBe(false);
    });
  });
});
