import "server-only";
import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { products } from "@/data/products";
import { defaultPayment, type StoreData } from "@/data/settings";

const defaults = { products, payment: defaultPayment, revision: 0 };
let ready: Promise<Client> | undefined;

export function storageConfigured() {
  return Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN)
    || (!process.env.VERCEL && !process.env.TURSO_DATABASE_URL);
}

async function open() {
  if (!storageConfigured()) throw new Error("Настройте подключение к базе Turso");
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) mkdirSync(".data", { recursive: true });
  const db = createClient({ url: url || "file:.data/black-tide.sqlite", authToken: process.env.TURSO_AUTH_TOKEN });
  try {
    await db.batch([
      "CREATE TABLE IF NOT EXISTS store (id INTEGER PRIMARY KEY, data TEXT NOT NULL, revision INTEGER NOT NULL)",
      "CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, data BLOB NOT NULL)",
      "CREATE TABLE IF NOT EXISTS login_attempts (id INTEGER PRIMARY KEY, count INTEGER NOT NULL, started INTEGER NOT NULL)",
      { sql: "INSERT OR IGNORE INTO store(id,data,revision) VALUES(1,?,0)", args: [JSON.stringify(defaults)] },
    ], "write");
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

export function database() {
  return ready ??= open().catch(error => { ready = undefined; throw error; });
}

export async function readStore(): Promise<StoreData> {
  if (!storageConfigured()) return defaults;
  const db = await database();
  const { rows: [row] } = await db.execute("SELECT data, revision FROM store WHERE id=1");
  return { ...JSON.parse(String(row.data)), revision: Number(row.revision) };
}

export async function saveStore(data: StoreData) {
  const db = await database();
  const result = await db.execute({
    sql: "UPDATE store SET data=?,revision=revision+1 WHERE id=1 AND revision=?",
    args: [JSON.stringify({ products: data.products, payment: data.payment }), data.revision],
  });
  return result.rowsAffected === 1;
}
