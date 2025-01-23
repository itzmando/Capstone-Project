const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, city } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name, ct.name as city_name,
             COUNT(*) OVER() as total_count
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN cities ct ON p.city_id = ct.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (category) {
      query += ` AND c.id = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }

    if (city) {
      query += ` AND ct.id = $${paramCount}`;
      queryParams.push(city);
      paramCount++;
    }

    query += ` ORDER BY p.name
               LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    const totalCount = result.rows[0]?.total_count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      places: result.rows,
      pagination: {
        total: parseInt(totalCount),
        pages: totalPages,
        current_page: parseInt(page),
        per_page: parseInt(limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const placeResult = await pool.query(`
      SELECT p.*, 
             c.name as category_name,
             ct.name as city_name,
             COUNT(DISTINCT r.id) as review_count,
             COALESCE(AVG(r.rating), 0) as average_rating
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN cities ct ON p.city_id = ct.id
      LEFT JOIN reviews r ON p.id = r.place_id
      WHERE p.id = $1
      GROUP BY p.id, c.name, ct.name
    `, [id]);

    if (placeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }

    const reviewsResult = await pool.query(`
      SELECT r.*, 
             u.username, 
             u.full_name,
             COUNT(p.id) as photo_count
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN photos p ON r.id = p.review_id
      WHERE r.place_id = $1
      GROUP BY r.id, u.username, u.full_name
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [id]);

    const photosResult = await pool.query(`
      SELECT p.*, u.username
      FROM photos p
      JOIN users u ON p.user_id = u.id
      WHERE p.place_id = $1
      ORDER BY p.created_at DESC
      LIMIT 5
    `, [id]);

    const place = placeResult.rows[0];
    place.reviews = reviewsResult.rows;
    place.photos = photosResult.rows;

    res.json(place);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;