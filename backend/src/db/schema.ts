import { int, mysqlEnum, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Vehicles table for vehicle management system.
 */
export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  placa: varchar("placa", { length: 10 }).notNull().unique(),
  marca: varchar("marca", { length: 100 }).notNull(),
  modelo: varchar("modelo", { length: 100 }).notNull(),
  ano: int("ano").notNull(),
  cor: varchar("cor", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["ativo", "inativo"]).default("ativo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;
