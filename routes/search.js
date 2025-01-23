const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { q, category, city, rating, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT p.*, 
             c.name as category_name,
             ct.name as city_name,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(DISTINCT r.id) as review_count,
             COUNT(*) OVER() as total_count
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN cities ct ON p.city_id = ct.id
      LEFT JOIN reviews r ON p.id = r.place_id
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

    query += ` GROUP BY p.id, c.name, ct.name`;

    if (rating) {
      query += ` HAVING COALESCE(AVG(r.rating), 0) >= $${paramCount}`;
      queryParams.push(parseFloat(rating));
      paramCount++;
    }

    query += ` ORDER BY avg_rating DESC NULLS LAST, p.name
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

module.exports = router;