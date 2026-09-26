import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tx } from './db.js';

const schemaFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '../database/schema.sql');

// Applies database/schema.sql. Idempotent; an advisory lock keeps two server instances from migrating at once.
export async function migrate() {
  const sql = fs.readFileSync(schemaFile, 'utf8');
  await tx(async (c) => {
    await c.query('SELECT pg_advisory_xact_lock(14001)');
    await c.query(sql);
  });
}
