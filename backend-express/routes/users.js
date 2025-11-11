import { Router } from 'express';
import { getPool } from '../db/sql.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();
router.use(requireAuth, requireRole('SUPERADMIN'));

router.get(
  '/pending',
  asyncHandler(async (_req, res) => {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, name, email, status FROM Users WHERE status = 'PENDING' ORDER BY createdAt ASC"
    );
    res.json(rows);
  })
);

router.post(
  '/:id/approve',
  asyncHandler(async (req, res) => {
    const pool = getPool();
    await pool.execute("UPDATE Users SET status = 'APPROVED' WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  })
);

router.post(
  '/:id/deny',
  asyncHandler(async (req, res) => {
    const pool = getPool();
    await pool.execute("UPDATE Users SET status = 'DENIED' WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  })
);

export default router;
