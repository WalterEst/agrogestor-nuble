import { Router } from 'express';
import { getPool } from '../db/sql.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();
router.use(requireAuth, requireRole('SUPERADMIN'));

router.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    const pool = getPool();
    const [[userStats]] = await pool.query(`
      SELECT
        COUNT(*) AS totalUsers,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approvedUsers,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pendingUsers
      FROM Users
    `);

    const [[postStats]] = await pool.query(`
      SELECT
        COUNT(*) AS totalPosts,
        SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) AS activePosts,
        SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) AS inactivePosts
      FROM Posts
    `);

    const [pendingUsers] = await pool.query(`
      SELECT id, name, email, status, createdAt
      FROM Users
      WHERE status = 'PENDING'
      ORDER BY createdAt ASC
      LIMIT 5
    `);

    res.json({
      users: {
        total: Number(userStats?.totalUsers || 0),
        approved: Number(userStats?.approvedUsers || 0),
        pending: Number(userStats?.pendingUsers || 0),
      },
      posts: {
        total: Number(postStats?.totalPosts || 0),
        active: Number(postStats?.activePosts || 0),
        inactive: Number(postStats?.inactivePosts || 0),
      },
      pendingUsers,
    });
  })
);

router.get(
  '/posts',
  asyncHandler(async (_req, res) => {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.title,
        p.description,
        p.price,
        p.isActive,
        p.createdAt,
        u.name AS seller,
        u.email AS sellerEmail
      FROM Posts p
      JOIN Users u ON u.id = p.userId
      ORDER BY p.createdAt DESC
    `);
    res.json(rows);
  })
);

router.patch(
  '/posts/:id/toggle',
  asyncHandler(async (req, res) => {
    const pool = getPool();
    const [result] = await pool.execute('UPDATE Posts SET isActive = IF(isActive = 1, 0, 1) WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const [[post]] = await pool.query(
      `SELECT
        p.id,
        p.title,
        p.description,
        p.price,
        p.isActive,
        p.createdAt,
        u.name AS seller,
        u.email AS sellerEmail
      FROM Posts p
      JOIN Users u ON u.id = p.userId
      WHERE p.id = ?`,
      [req.params.id]
    );

    res.json(post);
  })
);

export default router;
