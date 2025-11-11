import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../db/sql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, '../db/migrations');

const pool = getPool();
for (const f of readdirSync(dir).sort()) {
  const sql = readFileSync(path.join(dir, f), 'utf8');
  console.log('Running', f);
  await pool.query(sql);
}
await pool.end();
console.log('Migrations done');
process.exit(0);
