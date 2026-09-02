import Database from "better-sqlite3";
import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "./schema";
import { seedIfEmpty } from "./seed";

let dbInstance: Database.Database | null = null;

export function getDbPath(): string {
  const dir = app.isPackaged
    ? app.getPath("userData")
    : path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "hkd.db");
}

export function getImagesDir(): string {
  const dir = app.isPackaged
    ? path.join(app.getPath("userData"), "images")
    : path.join(process.cwd(), "data", "images");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function initDatabase(): Database.Database {
  if (dbInstance) return dbInstance;
  const dbPath = getDbPath();
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA_SQL);
  seedIfEmpty(db);
  dbInstance = db;
  return db;
}

export function getDb(): Database.Database {
  if (!dbInstance) throw new Error("Database not initialized yet");
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.pragma("wal_checkpoint(TRUNCATE)");
    dbInstance.close();
    dbInstance = null;
  }
}
