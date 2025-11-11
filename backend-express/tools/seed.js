import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../db/sql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sql = readFileSync(path.join(__dirname, '../db/seeds/seed_superadmin.sql'), 'utf8');
const pool = getPool();
await pool.query(sql);
await pool.end();
console.log('Seed done');
process.exit(0);
