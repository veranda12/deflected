import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

function create(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const client = postgres(url, {
    max: process.env.DB_POOL_MAX ? Number(process.env.DB_POOL_MAX) : 5,
    idle_timeout: 20,
    connect_timeout: 10,
    // Transaction-mode poolers (Supabase/Neon pooler, Hyperdrive) do not support prepared statements.
    prepare: process.env.DB_PREPARE === "1",
  });
  return drizzle(client, { schema });
}

const globalForDb = globalThis as unknown as { __dflctdDb?: Db };

/**
 * Long-lived servers (next dev / next start) reuse one pool.
 * On Cloudflare Workers set DB_PER_REQUEST=1: I/O objects cannot be shared across requests there.
 */
export function getDb(): Db {
  if (process.env.DB_PER_REQUEST === "1") return create();
  if (!globalForDb.__dflctdDb) globalForDb.__dflctdDb = create();
  return globalForDb.__dflctdDb;
}

export { schema };
