import "server-only";

import { Pool, type QueryResult, type QueryResultRow } from "pg";

let pool: Pool | null = null;

function getConnectionString() {
  const connectionString = process.env.SUPABASE_DB_POOLER_URL || process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    throw new Error("Missing SUPABASE_DB_POOLER_URL or SUPABASE_DB_URL for server auth queries.");
  }

  return connectionString;
}

export function getPostgresPool() {
  if (!pool) {
    const connectionString = getConnectionString();

    pool = new Pool({
      connectionString,
      max: 5,
      ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    });
  }

  return pool;
}

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> {
  return getPostgresPool().query<T>(text, values);
}
