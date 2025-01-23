const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.post('/:placeId', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;
    const { placeId } = req.params;

    const result = await db.query(
      `INSERT INTO bookmarks (user_id, place_id, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, placeId, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { 
      return res.status(400).json({ error: 'Place already bookmarked' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;