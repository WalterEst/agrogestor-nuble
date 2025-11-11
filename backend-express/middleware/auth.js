import { Buffer } from 'node:buffer';
import { getPool } from '../db/sql.js';
import { asyncHandler } from './async-handler.js';

async function authenticateBasic(header) {
  if (!header?.startsWith('Basic ')) {
    const error = new Error('No autorizado');
    error.status = 401;
    throw error;
  }

  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const separator = decoded.indexOf(':');
  if (separator === -1) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const email = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT id, name, email, role, status FROM Users WHERE email = ? AND password = ? LIMIT 1",
    [email, password]
  );

  const user = rows[0];
  if (!user) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  if (user.status !== 'APPROVED') {
    const error = new Error('Cuenta no aprobada');
    error.status = 403;
    throw error;
  }

  return user;
}

export const requireAuth = asyncHandler(async (req, res, next) => {
  try {
    const user = await authenticateBasic(req.headers.authorization || '');
    req.user = user;
    next();
  } catch (error) {
    return res.status(error.status || 401).json({ error: error.message });
  }
});

export function requireRole(role) {
  return (req, res, next) =>
    req.user?.role === role ? next() : res.status(403).json({ error: 'Sin permisos' });
}
