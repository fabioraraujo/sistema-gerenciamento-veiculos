import { and, eq, like, sql, desc } from "drizzle-orm";
import { getDb, vehicles, InsertVehicle, Vehicle } from "./index";

export interface VehicleFilters {
  marca?: string;
  modelo?: string;
  status?: "ativo" | "inativo";
  page?: number;
  pageSize?: number;
}

export interface PaginatedVehicles {
  data: Vehicle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getVehicles(
  filters: VehicleFilters = {}
): Promise<PaginatedVehicles> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { marca, modelo, status, page = 1, pageSize = 10 } = filters;

  const conditions = [];

  if (marca) {
    conditions.push(like(vehicles.marca, `%${marca}%`));
  }
  if (modelo) {
    conditions.push(like(vehicles.modelo, `%${modelo}%`));
  }
  if (status) {
    conditions.push(eq(vehicles.status, status));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(vehicles)
    .where(whereClause);
  const total = Number(countResult[0]?.count ?? 0);

  // Get paginated data
  const offset = (page - 1) * pageSize;
  const data = await db
    .select()
    .from(vehicles)
    .where(whereClause)
    .orderBy(desc(vehicles.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getVehicleById(id: number): Promise<Vehicle | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function getVehicleByPlaca(placa: string): Promise<Vehicle | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.placa, placa))
    .limit(1);

  return result[0] ?? null;
}

export async function createVehicle(
  data: Omit<InsertVehicle, "id" | "createdAt" | "updatedAt">
): Promise<Vehicle> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(vehicles).values(data);
  const insertId = result[0].insertId;

  const created = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, insertId))
    .limit(1);

  return created[0]!;
}

export async function updateVehicle(
  id: number,
  data: Partial<Omit<InsertVehicle, "id" | "createdAt" | "updatedAt">>
): Promise<Vehicle | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(vehicles)
    .set(data)
    .where(eq(vehicles.id, id));

  return getVehicleById(id);
}

export async function deleteVehicle(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .delete(vehicles)
    .where(eq(vehicles.id, id));

  return result[0].affectedRows > 0;
}

export async function getDistinctMarcas(): Promise<string[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .selectDistinct({ marca: vehicles.marca })
    .from(vehicles)
    .orderBy(vehicles.marca);

  return result.map((r) => r.marca);
}

export async function getDistinctModelos(marca?: string): Promise<string[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const conditions = [];
  if (marca) {
    conditions.push(eq(vehicles.marca, marca));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db
    .selectDistinct({ modelo: vehicles.modelo })
    .from(vehicles)
    .where(whereClause)
    .orderBy(vehicles.modelo);

  return result.map((r) => r.modelo);
}
