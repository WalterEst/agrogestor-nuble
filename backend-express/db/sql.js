import 'dotenv/config';
import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'agrogestor',
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: false,
      multipleStatements: true,
    });
  }

  return pool;
}
