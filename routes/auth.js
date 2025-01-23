const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, full_name, country = 'Unknown' } = req.body;
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, country)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, full_name;`,
      [username, email, hashedPassword, full_name, country]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1;',
        [email]
      );
  
      const user = result.rows[0];
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const validPassword = await bcrypt.compare(password, user.password_hash);
  
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "shhh",
        { expiresIn: '24h' }
      ); console.log('JWT Secret:', process.env.JWT_SECRET ? 'Is set' : 'Not set');
  
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
  
      res.json(token);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  module.exports = router;