const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

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

router.get('/featured-reviews', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, 
             u.username as user_name, 
             p.name as place_name 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN places p ON r.place_id = p.id
      WHERE r.rating >= 4
      ORDER BY r.created_at DESC
      LIMIT 5
    `);
    res.json(result.rows);
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
             (
               SELECT json_agg(
                 json_build_object(
                   'id', p.id,
                   'photo_url', p.photo_url,
                   'caption', p.caption,
                   'uploaded_at', p.uploaded_at
                 )
               )
               FROM photos p
               WHERE p.review_id = r.id
             ) as photos
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.place_id = $1
      ORDER BY r.created_at DESC
    `, [id]);

    const place = placeResult.rows[0];
    place.reviews = reviewsResult.rows.map(review => ({
      ...review,
      photos: review.photos || []
    }));

    res.json(place);
  } catch (err) {
    console.error('Error fetching place details:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;