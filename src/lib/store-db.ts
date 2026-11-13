import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { products } from "@/data/products";
import { defaultPayment, type StoreData } from "@/data/settings";

let connection: DatabaseSync | undefined;
export function database() {
  if (connection) return connection;
  const path = resolve(
    /* turbopackIgnore: true */
    process.env.STORE_DATABASE_PATH || ".data/black-tide.sqlite",
  );
  mkdirSync(dirname(path), { recursive: true });
  connection = new DatabaseSync(path);
  connection.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS store (id INTEGER PRIMARY KEY CHECK(id=1),data TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY,data BLOB NOT NULL);
    CREATE TABLE IF NOT EXISTS login_attempts (id INTEGER PRIMARY KEY CHECK(id=1),count INTEGER NOT NULL,started INTEGER NOT NULL);
  `);
  connection
    .prepare("INSERT OR IGNORE INTO store(id,data,revision) VALUES(1,?,0)")
    .run(JSON.stringify({ products, payment: defaultPayment }));
  return connection;
}
export function readStore(): StoreData {
  const row = database()
    .prepare("SELECT data,revision FROM store WHERE id=1")
    .get() as { data: string; revision: number };
  return { ...JSON.parse(row.data), revision: row.revision };
}
export function saveStore(data: StoreData): boolean {
  return (
    database()
      .prepare(
        "UPDATE store SET data=?,revision=revision+1 WHERE id=1 AND revision=?",
      )
      .run(
        JSON.stringify({ products: data.products, payment: data.payment }),
        data.revision,
      ).changes === 1
  );
}
