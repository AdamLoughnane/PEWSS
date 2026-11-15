import "server-only";
import { Pool, types, type QueryResultRow } from "pg";
import { attachDatabasePool } from "@vercel/functions";

// Preserve database timestamps as strings, as in the original stored records.
types.setTypeParser(1184, (value) => value);
let pool: Pool | undefined;
export function database() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error("PEWSS database is not configured");
    const url = new URL(process.env.DATABASE_URL);
    // Do not let connection-string SSL options override certificate verification.
    for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) url.searchParams.delete(key);
    pool = new Pool({
      connectionString: url.toString(),
      ssl: { rejectUnauthorized: true },
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 15000,
      statement_timeout: 20000,
      application_name: "pewss",
    });
    pool.on("error", () => console.error("PEWSS idle database connection failed"));
    attachDatabasePool(pool);
  }
  return pool;
}
export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return database().query<T>(text, values);
}
