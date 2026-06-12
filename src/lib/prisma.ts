import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import path from "node:path";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const databaseUrl = process.env.DATABASE_URL ?? (process.env.VERCEL ? "file:/tmp/papertrack.db" : "file:/Users/railes/.papertrack/dev.db");

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

let isReady = false;
let isInitializing = false;
let readyPromise: Promise<void> | null = null;

async function ensureSqliteDatabase() {
  if (isReady || !databaseUrl.startsWith("file:")) return;
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    if (isReady) return;
    isInitializing = true;
    try {
      const tables = await prisma.$queryRawUnsafe<Array<{ name: string }>>("SELECT name FROM sqlite_master WHERE type='table' AND name='Paper'");
      if (tables.length === 0) {
        for (const statement of await getRuntimeInitStatements()) {
          await prisma.$executeRawUnsafe(statement);
        }
      } else {
        await applyRuntimeSchemaUpdates();
      }
      isReady = true;
    } finally {
      isInitializing = false;
    }
  })();

  return readyPromise;
}

async function applyRuntimeSchemaUpdates() {
  await ensureColumns("FileRecord", [
    ["downloadUrl", "TEXT"],
    ["storageProvider", "TEXT NOT NULL DEFAULT 'EXTERNAL'"],
    ["storagePath", "TEXT"],
    ["mimeType", "TEXT"],
    ["fileSize", "INTEGER"],
    ["sourceFileId", "TEXT"],
    ["versionGroupId", "TEXT"],
    ["versionNumber", "INTEGER NOT NULL DEFAULT 1"],
    ["isCurrent", "BOOLEAN NOT NULL DEFAULT 1"]
  ]);
  await ensureColumns("Submission", [["submittedFileRecordId", "TEXT"]]);
  await prisma.$executeRawUnsafe("UPDATE FileRecord SET storageProvider = 'EXTERNAL' WHERE storageProvider IS NULL OR storageProvider = ''");
  await prisma.$executeRawUnsafe("UPDATE FileRecord SET versionNumber = 1 WHERE versionNumber IS NULL");
  await prisma.$executeRawUnsafe("UPDATE FileRecord SET isCurrent = 1 WHERE isCurrent IS NULL");
}

async function ensureColumns(tableName: string, columns: Array<[string, string]>) {
  const rows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("${tableName}")`);
  const existing = new Set(rows.map((row) => row.name));
  for (const [name, definition] of columns) {
    if (!existing.has(name)) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${tableName}" ADD COLUMN "${name}" ${definition}`);
    }
  }
}

prisma.$use(async (_params, next) => {
  if (!isInitializing) {
    await ensureSqliteDatabase();
  }
  return next(_params);
});

async function getRuntimeInitStatements() {
  const sql = await readFile(path.join(process.cwd(), "prisma", "init.sql"), "utf-8");
  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean)
    .filter((statement) => !/^DROP TABLE/i.test(statement))
    .map((statement) =>
      statement
        .replace(/^CREATE TABLE\s+/i, "CREATE TABLE IF NOT EXISTS ")
        .replace(/^CREATE UNIQUE INDEX\s+/i, "CREATE UNIQUE INDEX IF NOT EXISTS ")
        .replace(/^CREATE INDEX\s+/i, "CREATE INDEX IF NOT EXISTS ")
    );
}
