import { Router } from 'express';
import { getPool } from '../db/sql.js';
import { requireAuth } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { validate, postRules } from '../middleware/validators.js';
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

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT p.id, p.title, p.description, p.price, p.imageUrl, p.createdAt, p.isActive, u.name AS seller FROM Posts p JOIN Users u ON u.id = p.userId WHERE p.isActive = 1 ORDER BY p.createdAt DESC"
    );
    res.json(rows);
  })
);

router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM Posts WHERE userId = ? ORDER BY createdAt DESC',
      [req.user.id]
    );
    res.json(rows);
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
    const [[post]] = await pool.query('SELECT * FROM Posts WHERE id = ?', [req.params.id]);
    res.json(post);
  })
);

export default router;
