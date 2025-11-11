import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getPool } from '../db/sql.js';
import { validate, registerRules, loginRules } from '../middleware/validators.js';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

router.post(
  '/register',
  validate(registerRules),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const pool = getPool();
    const [exists] = await pool.execute('SELECT 1 FROM Users WHERE email = ?', [email]);

    if (exists.length) {
      return res.status(409).json({ error: 'Email ya registrado' });
    }

    const id = uuid();
    await pool.execute(
      "INSERT INTO Users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, 'USER', 'PENDING')",
      [id, name, email, password]
    );

    res
      .status(201)
      .json({ message: 'Solicitud enviada. Un super admin debe aprobarte.' });
  })
);

router.post(
  '/login',
  validate(loginRules),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT id, name, email, role, status FROM Users WHERE email = ? AND password = ? LIMIT 1",
      [email, password]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (user.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Cuenta no aprobada' });
    }

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  })
);

export default router;
