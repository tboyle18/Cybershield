const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// GET /api/modules — list all modules
router.get('/', requireAuth, async (req, res) => {
  try {
    const modules = await pool.query('SELECT * FROM modules ORDER BY sort_order');
    const progress = await pool.query(
      'SELECT module_id, progress_pct, completed_at FROM user_module_progress WHERE user_id = $1',
      [req.user.id]
    );
    const progressMap = {};
    progress.rows.forEach(p => { progressMap[p.module_id] = p; });
    const result = modules.rows.map(m => ({
      ...m,
      progress: progressMap[m.id]?.progress_pct || 0,
      completed: !!progressMap[m.id]?.completed_at,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/modules/:id/progress — update module progress
router.post('/:id/progress', requireAuth, async (req, res) => {
  const { progress_pct, section_id } = req.body;
  const moduleId = req.params.id;
  try {
    await pool.query(
      `INSERT INTO user_module_progress (user_id, module_id, progress_pct, completed_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, module_id) DO UPDATE
       SET progress_pct = GREATEST(user_module_progress.progress_pct, $3),
           completed_at = CASE WHEN $3 = 100 THEN NOW() ELSE user_module_progress.completed_at END,
           updated_at = NOW()`,
      [req.user.id, moduleId, progress_pct, progress_pct === 100 ? new Date() : null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/modules/:id/quiz — submit quiz result
router.post('/:id/quiz', requireAuth, async (req, res) => {
  const { section_id, score, total, points_earned } = req.body;
  const moduleId = req.params.id;
  try {
    await pool.query(
      'INSERT INTO quiz_results (user_id, module_id, section_id, score, total, points_earned) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.user.id, moduleId, section_id, score, total, points_earned]
    );
    await pool.query(
      'UPDATE users SET points = points + $1 WHERE id = $2',
      [points_earned, req.user.id]
    );
    res.json({ success: true, points_earned });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/modules/quiz-history
router.get('/quiz-history', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT qr.*, m.title as module_title
       FROM quiz_results qr
       JOIN modules m ON m.id = qr.module_id
       WHERE qr.user_id = $1
       ORDER BY qr.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
