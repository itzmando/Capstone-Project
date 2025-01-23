const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const pool = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT u.id, u.username, u.email, u.role, u.full_name, 
               COUNT(DISTINCT r.id) as review_count
        FROM users u
        LEFT JOIN reviews r ON u.id = r.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  router.post('/api/admin/places', authenticateToken, isAdmin, upload.single('photo'), async (req, res) => {
    try {
      const { name, category_id, city_id, description } = req.body;
      if (!name || !category_id || !req.file) {
        return res.status(400).json({ error: 'Name, category, and photo are required' });
      }
      
      const result = await pool.query(
        `INSERT INTO places (name, category_id, city_id, description, photo_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, category_id, city_id, description, `/uploads/${req.file.filename}`]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  router.put('/api/admin/places/:id', authenticateToken, isAdmin, upload.single('photo'), async (req, res) => {
    try {
      const { name, category_id, city_id, description } = req.body;
      if (!name || !category_id) {
        return res.status(400).json({ error: 'Name and category are required' });
      }
      
      let photoUrl = undefined;
      if (req.file) {
        photoUrl = `/uploads/${req.file.filename}`;
      }
      
      const result = await pool.query(
        `UPDATE places 
         SET name = $1, category_id = $2, city_id = $3, description = $4 ${photoUrl ? ', photo_url = $5' : ''}
         WHERE id = ${photoUrl ? '$6' : '$5'}
         RETURNING *`,
        photoUrl 
          ? [name, category_id, city_id, description, photoUrl, req.params.id]
          : [name, category_id, city_id, description, req.params.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Place not found' });
      }
      
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  router.delete('/api/admin/places/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const result = await pool.query(
        'DELETE FROM places WHERE id = $1 RETURNING *',
        [req.params.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Place not found' });
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  module.exports = router;