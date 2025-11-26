// Lightweight wrapper to load the sqlite Prisma client generated under prisma/node_modules
// This keeps the main PostgreSQL schema intact while allowing local dev to use a sqlite db
import { PrismaClient } from "../prisma/node_modules/@prisma/client";

export const dbSqlite = globalThis.prismaSqlite || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prismaSqlite = dbSqlite;
