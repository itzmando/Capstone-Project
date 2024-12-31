const express = require("express");
const app = express();
const pg = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = new pg.Client(process.env.DATABASE_URL || "postgres://localhost/acme_world_travel_db");

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token' });
      req.user = user;
      next();
    });
  };
  
  // Authentication Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password, full_name } = req.body;
  
      // Check if user exists
      const userExists = await pool.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );
  
      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create user
      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, full_name, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         RETURNING user_id, username, email, full_name`,
        [username, email, hashedPassword, full_name]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find user
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
  
      const user = result.rows[0];
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Check password
      const validPassword = await bcrypt.compare(password, user.password_hash);
  
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Create token
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
  
      // Update last login
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
        [user.user_id]
      );
  
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // User Routes
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT user_id, username, email, full_name, bio, country, created_at FROM users WHERE user_id = $1',
        [req.user.user_id]
      );
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
      const { full_name, bio, country } = req.body;
  
      const result = await pool.query(
        `UPDATE users 
         SET full_name = COALESCE($1, full_name),
             bio = COALESCE($2, bio),
             country = COALESCE($3, country)
         WHERE user_id = $4
         RETURNING user_id, username, email, full_name, bio, country`,
        [full_name, bio, country, req.user.user_id]
      );
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Place Routes
  app.get('/api/places', async (req, res) => {
    try {
      const { page = 1, limit = 10, category, city } = req.query;
      const offset = (page - 1) * limit;
  
      let query = `
        SELECT p.*, c.name as category_name, ct.name as city_name,
               COUNT(*) OVER() as total_count
        FROM places p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN cities ct ON p.city_id = ct.city_id
        WHERE 1=1
      `;
      const queryParams = [];
      let paramCount = 1;
  
      if (category) {
        query += ` AND p.category_id = $${paramCount}`;
        queryParams.push(category);
        paramCount++;
      }
  
      if (city) {
        query += ` AND p.city_id = $${paramCount}`;
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
  
  app.get('/api/places/:id', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT p.*, c.name as category_name, ct.name as city_name,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.review_id) as review_count
         FROM places p
         LEFT JOIN categories c ON p.category_id = c.category_id
         LEFT JOIN cities ct ON p.city_id = ct.city_id
         LEFT JOIN reviews r ON p.place_id = r.place_id
         WHERE p.place_id = $1
         GROUP BY p.place_id, c.name, ct.name`,
        [req.params.id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Place not found' });
      }
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Review Routes
  app.post('/api/places/:placeId/reviews', authenticateToken, async (req, res) => {
    try {
      const { rating, title, content, visit_date } = req.body;
      const { placeId } = req.params;
  
      const result = await pool.query(
        `INSERT INTO reviews (user_id, place_id, rating, title, content, visit_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [req.user.user_id, placeId, rating, title, content, visit_date]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.get('/api/places/:placeId/reviews', async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
  
      const result = await pool.query(
        `SELECT r.*, u.username, u.profile_picture_url,
                COUNT(*) OVER() as total_count
         FROM reviews r
         JOIN users u ON r.user_id = u.user_id
         WHERE r.place_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.params.placeId, limit, offset]
      );
  
      const totalCount = result.rows[0]?.total_count || 0;
      const totalPages = Math.ceil(totalCount / limit);
  
      res.json({
        reviews: result.rows,
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
  
  app.put('/api/reviews/:id', authenticateToken, async (req, res) => {
    try {
      const { rating, title, content } = req.body;
  
      // Check if review belongs to user
      const review = await pool.query(
        'SELECT * FROM reviews WHERE review_id = $1',
        [req.params.id]
      );
  
      if (review.rows.length === 0) {
        return res.status(404).json({ error: 'Review not found' });
      }
  
      if (review.rows[0].user_id !== req.user.user_id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
  
      const result = await pool.query(
        `UPDATE reviews
         SET rating = COALESCE($1, rating),
             title = COALESCE($2, title),
             content = COALESCE($3, content),
             updated_at = CURRENT_TIMESTAMP
         WHERE review_id = $4
         RETURNING *`,
        [rating, title, content, req.params.id]
      );
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
    try {
      // Check if review belongs to user
      const review = await pool.query(
        'SELECT * FROM reviews WHERE review_id = $1',
        [req.params.id]
      );
  
      if (review.rows.length === 0) {
        return res.status(404).json({ error: 'Review not found' });
      }
  
      if (review.rows[0].user_id !== req.user.user_id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
  
      await pool.query(
        'DELETE FROM reviews WHERE review_id = $1',
        [req.params.id]
      );
  
      res.json({ message: 'Review deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
  });
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });



const init = async () => {
    const port = process.env.PORT || 3000;
    app.listen(port , () => console.log(`listening on port ${port}`));
};



init();