import { PrismaClient } from "@prisma/client";
let dbClient;

// If local development is configured to use SQLite (DATABASE_URL=file:...),
// prefer the sqlite-specific generated client which is kept under prisma/node_modules.
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("file:")) {
  try {
    // eslint-disable-next-line import/no-unresolved
    const { dbSqlite } = await import("./prisma-sqlite.js");
    dbClient = dbSqlite;
  } catch (err) {
    // fallback to default client if for some reason sqlite client isn't available
    dbClient = globalThis.prisma || new PrismaClient();
    if (process.env.NODE_ENV !== "production") globalThis.prisma = dbClient;
  }
} else {
  dbClient = globalThis.prisma || new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalThis.prisma = dbClient;
}

export const db = dbClient;

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
