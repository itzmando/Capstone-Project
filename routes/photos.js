const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.post('/:placeId', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await pool.query(
      `INSERT INTO photos (user_id, place_id, photo_url, caption)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, req.params.placeId, `/uploads/${req.file.filename}`, req.body.caption]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;