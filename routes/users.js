const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.get('/profile', authenticateToken, async (req, res, next) => {
    try {
      const result = await pool.query(
        'SELECT id, username, email, full_name, bio, country, created_at FROM users WHERE id = $1',
        [req.user.id]
      );
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  router.get('/api/users/reviews', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT r.*, p.name as place_name 
         FROM reviews r
         JOIN places p ON r.place_id = p.id
         WHERE r.user_id = $1
         ORDER BY r.created_at DESC`,
        [req.user.id]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  router.get('/api/users/comments', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT c.*, r.title as review_title, p.name as place_name
         FROM comments c
         JOIN reviews r ON c.review_id = r.id
         JOIN places p ON r.place_id = p.id
         WHERE c.user_id = $1
         ORDER BY c.created_at DESC`,
        [req.user.id]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  module.exports = router;