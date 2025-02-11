const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs').promises;

const uploadDir = 'uploads/photos';
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.post('/:placeId', authenticateToken, async (req, res) => {
  try {
    const { rating, title, content, visit_date } = req.body;
    const { placeId } = req.params;

    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(400).json({
        error: 'Invalid user ID',
        details: 'User does not exist in database'
      });
    }

    if (!rating || !title || !content || !visit_date) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: {
          rating: !rating,
          title: !title,
          content: !content,
          visit_date: !visit_date
        }
      });
    }

    const placeCheck = await pool.query(
      'SELECT id FROM places WHERE id = $1',
      [placeId]
    );

    if (placeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }

    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND place_id = $2',
      [req.user.id, placeId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        error: 'You have already reviewed this place'
      });
    }

    const result = await pool.query(`
      WITH new_review AS (
        INSERT INTO reviews (user_id, place_id, rating, title, content, visit_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      )
      SELECT r.*, u.username, u.full_name as user_name
      FROM new_review r
      JOIN users u ON r.user_id = u.id
    `, [req.user.id, placeId, rating, title, content, visit_date]);

    await pool.query(`
      UPDATE places
      SET 
        avg_rating = (
          SELECT AVG(rating)::DECIMAL(3,2)
          FROM reviews
          WHERE place_id = $1
        ),
        review_count = (
          SELECT COUNT(*)
          FROM reviews
          WHERE place_id = $1
        )
      WHERE id = $1
    `, [placeId]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating review:', err);
    if (err.code === '23503') {
      res.status(400).json({
        error: 'Invalid user or place ID',
        details: err.detail
      });
    } else {
      res.status(500).json({
        error: 'Server error',
        details: err.message
      });
    }
  }
});

router.get('/:reviewId/comments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.username as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.review_id = $1
      ORDER BY c.created_at DESC
    `, [req.params.reviewId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:reviewId/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const { reviewId } = req.params;

    const reviewExists = await pool.query(
      'SELECT id FROM reviews WHERE id = $1',
      [reviewId]
    );

    if (reviewExists.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const result = await pool.query(`
      WITH new_comment AS (
        INSERT INTO comments (user_id, review_id, content)
        VALUES ($1, $2, $3)
        RETURNING *
      )
      SELECT c.*, u.username as user_name
      FROM new_comment c
      JOIN users u ON c.user_id = u.id
    `, [req.user.id, reviewId, content]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:reviewId/photos', authenticateToken, upload.array('photos', 5), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const reviewCheck = await pool.query(
      'SELECT id FROM reviews WHERE id = $1 AND user_id = $2',
      [reviewId, req.user.id]
    );

    if (reviewCheck.rows.length === 0) {
      if (req.files) {
        await Promise.all(req.files.map(file => 
          fs.unlink(path.join(uploadDir, file.filename)).catch(console.error)
        ));
      }
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No photos uploaded' });
    }

    const photos = await Promise.all(req.files.map(async file => {
      const result = await pool.query(
        `INSERT INTO photos (user_id, review_id, photo_url, thumbnail_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          req.user.id,
          reviewId,
          `/uploads/photos/${file.filename}`,
          `/uploads/photos/${file.filename}`
        ]
      );
      return result.rows[0];
    }));

    res.status(201).json({ photos });
  } catch (err) {
    if (req.files) {
      await Promise.all(req.files.map(file => 
        fs.unlink(path.join(uploadDir, file.filename)).catch(console.error)
      ));
    }
    console.error('Error uploading photos:', err);
    res.status(500).json({
      error: 'Failed to upload photos',
      message: err.message
    });
  }
});

router.delete('/:reviewId/photos/:photoId', authenticateToken, async (req, res) => {
  try {
    const { reviewId, photoId } = req.params;
    
    const reviewCheck = await pool.query(
      'SELECT id FROM reviews WHERE id = $1 AND user_id = $2',
      [reviewId, req.user.id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    const photoResult = await pool.query(
      'SELECT photo_url FROM photos WHERE id = $1 AND review_id = $2',
      [photoId, reviewId]
    );

    if (photoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    await pool.query(
      'DELETE FROM photos WHERE id = $1 AND review_id = $2',
      [photoId, reviewId]
    );

    const photoPath = path.join(__dirname, '..', 'public', photoResult.rows[0].photo_url);
    await fs.unlink(photoPath).catch(console.error);

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting photo:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { rating, title, content, visit_date } = req.body;
    const { id } = req.params;

    const reviewCheck = await pool.query(
      'SELECT place_id FROM reviews WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    const result = await pool.query(`
      WITH updated_review AS (
        UPDATE reviews 
        SET 
          rating = $1,
          title = $2,
          content = $3,
          visit_date = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 AND user_id = $6
        RETURNING *
      )
      SELECT r.*, u.username
      FROM updated_review r
      JOIN users u ON r.user_id = u.id
    `, [rating, title, content, visit_date, id, req.user.id]);

    await pool.query(`
      UPDATE places
      SET 
        avg_rating = (
          SELECT AVG(rating)::DECIMAL(3,2)
          FROM reviews
          WHERE place_id = $1
        )
      WHERE id = $1
    `, [reviewCheck.rows[0].place_id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reviewCheck = await pool.query(
      'SELECT place_id FROM reviews WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    const placeId = reviewCheck.rows[0].place_id;

    await pool.query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    await pool.query(`
      UPDATE places
      SET 
        avg_rating = (
          SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
          FROM reviews
          WHERE place_id = $1
        ),
        review_count = (
          SELECT COUNT(*)
          FROM reviews
          WHERE place_id = $1
        )
      WHERE id = $1
    `, [placeId]);

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const result = await pool.query(`
      UPDATE comments 
      SET content = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *`,
      [content, req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;