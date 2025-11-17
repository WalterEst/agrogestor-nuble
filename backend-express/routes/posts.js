import { Router } from 'express';
import { getPool } from '../db/sql.js';
import { requireAuth } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { validate, postRules, reviewRules } from '../middleware/validators.js';
import mime from 'mime-types';
import fs from 'fs';
import { asyncHandler } from '../middleware/async-handler.js';

const uploadsDir = path.resolve(process.env.UPLOADS_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = '.' + (mime.extension(file.mimetype) || 'dat');
    cb(null, uuid() + ext);
  },
});
const upload = multer({ storage });

const router = Router();

function normalizePostRow(row) {
  return {
    ...row,
    price: row.price != null ? Number(row.price) : null,
    isActive: row.isActive === 1 || row.isActive === true,
    averageRating: row.averageRating != null ? Number(row.averageRating) : null,
    reviewsCount: Number(row.reviewsCount ?? 0),
  };
}

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.userId,
        p.title,
        p.description,
        p.price,
        p.imageUrl,
        p.createdAt,
        p.isActive,
        u.name AS seller,
        COALESCE(ROUND(AVG(r.rating), 2), NULL) AS averageRating,
        COUNT(r.id) AS reviewsCount
      FROM Posts p
      JOIN Users u ON u.id = p.userId
      LEFT JOIN Reviews r ON r.postId = p.id
      WHERE p.isActive = 1
      GROUP BY p.id
      ORDER BY p.createdAt DESC
    `);
    res.json(rows.map(normalizePostRow));
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const pool = getPool();
    const [[row]] = await pool.query(
      `SELECT
        p.id,
        p.userId,
        p.title,
        p.description,
        p.price,
        p.imageUrl,
        p.createdAt,
        p.isActive,
        u.name AS seller,
        u.email AS sellerEmail,
        COALESCE(ROUND(AVG(r.rating), 2), NULL) AS averageRating,
        COUNT(r.id) AS reviewsCount
      FROM Posts p
      JOIN Users u ON u.id = p.userId
      LEFT JOIN Reviews r ON r.postId = p.id
      WHERE p.id = ? AND p.isActive = 1
      GROUP BY p.id`,
      [req.params.id]
    );

    if (!row) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    res.json(normalizePostRow(row));
  })
);

router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT
        p.id,
        p.userId,
        p.title,
        p.description,
        p.price,
        p.imageUrl,
        p.createdAt,
        p.isActive,
        COALESCE(ROUND(AVG(r.rating), 2), NULL) AS averageRating,
        COUNT(r.id) AS reviewsCount
      FROM Posts p
      LEFT JOIN Reviews r ON r.postId = p.id
      WHERE p.userId = ?
      GROUP BY p.id
      ORDER BY p.createdAt DESC`,
      [req.user.id]
    );
    res.json(rows.map(normalizePostRow));
  })
);

router.post(
  '/',
  requireAuth,
  upload.single('image'),
  validate(postRules),
  asyncHandler(async (req, res) => {
    const { title, description, price } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const pool = getPool();
    const id = uuid();
    await pool.execute(
      'INSERT INTO Posts (id, userId, title, description, price, imageUrl) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.user.id, title, description || null, Number(price), imageUrl]
    );
    const [[post]] = await pool.query('SELECT * FROM Posts WHERE id = ?', [id]);
    res.status(201).json(post);
  })
);

router.patch(
  '/:id/toggle',
  requireAuth,
  asyncHandler(async (req, res) => {
    const pool = getPool();
    const [result] = await pool.execute(
      'UPDATE Posts SET isActive = IF(isActive = 1, 0, 1) WHERE id = ? AND userId = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No encontrado' });
    }
    const [[post]] = await pool.query(
      `SELECT
        p.id,
        p.userId,
        p.title,
        p.description,
        p.price,
        p.imageUrl,
        p.createdAt,
        p.isActive,
        COALESCE(ROUND(AVG(r.rating), 2), NULL) AS averageRating,
        COUNT(r.id) AS reviewsCount
      FROM Posts p
      LEFT JOIN Reviews r ON r.postId = p.id
      WHERE p.id = ?
      GROUP BY p.id`,
      [req.params.id]
    );
    if (!post) {
      return res.status(404).json({ error: 'No encontrado' });
    }
    res.json(normalizePostRow(post));
  })
);

router.get(
  '/:id/reviews',
  asyncHandler(async (req, res) => {
    const pool = getPool();
    const [[post]] = await pool.query('SELECT id FROM Posts WHERE id = ?', [req.params.id]);
    if (!post) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const [rows] = await pool.query(
      `SELECT
        r.id,
        r.rating,
        r.comment,
        r.createdAt,
        r.updatedAt,
        u.id AS reviewerId,
        u.name AS reviewerName
      FROM Reviews r
      JOIN Users u ON u.id = r.userId
      WHERE r.postId = ?
      ORDER BY r.createdAt DESC`,
      [req.params.id]
    );

    res.json(rows);
  })
);

router.post(
  '/:id/reviews',
  requireAuth,
  validate(reviewRules),
  asyncHandler(async (req, res) => {
    const pool = getPool();
    const [[post]] = await pool.query('SELECT id, isActive FROM Posts WHERE id = ?', [req.params.id]);
    if (!post || post.isActive !== 1) {
      return res.status(404).json({ error: 'La publicación no está disponible para comentarios' });
    }

    const { rating, comment } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO Reviews (id, postId, userId, rating, comment)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
      [uuid(), req.params.id, req.user.id, Number(rating), comment?.trim() || null]
    );

    const [[review]] = await pool.query(
      `SELECT
        r.id,
        r.rating,
        r.comment,
        r.createdAt,
        r.updatedAt,
        u.id AS reviewerId,
        u.name AS reviewerName
      FROM Reviews r
      JOIN Users u ON u.id = r.userId
      WHERE r.postId = ? AND r.userId = ?`,
      [req.params.id, req.user.id]
    );

    const status = result.affectedRows === 1 ? 201 : 200;
    res.status(status).json(review);
  })
);

export default router;
