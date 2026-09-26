import pg from 'pg';

// BIGINT ids and NUMERIC prices come back from node-pg as strings by default.
// Convert them so the API returns real numbers.
pg.types.setTypeParser(20, (v) => Number(v));
pg.types.setTypeParser(1700, (v) => Number(v));

if (!process.env.DATABASE_URL) {
  console.error('\n✖ DATABASE_URL is not set. Copy .env.example to .env and fill it in.\n');
  process.exit(1);
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX || 10),
  // Managed databases (Neon, Supabase, Render...) usually require SSL: set PGSSL=true
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined
});

export const q = (text, params = []) => pool.query(text, params);

// Runs fn inside a transaction on one connection. Rolls back on any error.
export async function tx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* connection already broken */
    }
    throw err;
  } finally {
    client.release();
  }
}
