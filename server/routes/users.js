const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/users/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, points, badges_count, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, points, badges_count, created_at FROM users ORDER BY points DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/leaderboard
router.get('/leaderboard', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, role, points, badges_count FROM users ORDER BY points DESC LIMIT 20'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/me
router.patch('/me', requireAuth, async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), updated_at = NOW() WHERE id = $3 RETURNING id, name, email, role, points',
      [name, email, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/:id  (admin only — update any user's account)
router.patch('/:id', requireAdmin, async (req, res) => {
  const { name, email, role, department, password } = req.body;
  const targetId = req.params.id;
  try {
    const existing = await pool.query('SELECT id FROM users WHERE id = $1', [targetId]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    // Build dynamic update
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined)       { fields.push(`name = $${idx++}`);        values.push(name); }
    if (email !== undefined)      { fields.push(`email = $${idx++}`);       values.push(email.toLowerCase()); }
    if (role !== undefined)       { fields.push(`role = $${idx++}`);        values.push(role); }
    if (department !== undefined) { fields.push(`department = $${idx++}`);  values.push(department || null); }
    if (password) {
      if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
      const hashed = await bcrypt.hash(password, 12);
      fields.push(`password_hash = $${idx++}`);
      values.push(hashed);
    }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    fields.push(`updated_at = NOW()`);
    values.push(targetId);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, department, points, badges_count`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already in use by another account' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/:id  (admin only — offboard with SOC 2 archival)
router.delete('/:id', requireAdmin, async (req, res) => {
  const targetId = req.params.id;

  try {
    const userResult = await pool.query(
      'SELECT id, name, email, role, department FROM users WHERE id = $1 AND is_active = true',
      [targetId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const target = userResult.rows[0];

    // Collect all training records (step 9)
    const [progress, quizResults, simResults] = await Promise.all([
      pool.query('SELECT * FROM user_module_progress WHERE user_id = $1', [targetId]),
      pool.query('SELECT * FROM quiz_results WHERE user_id = $1', [targetId]),
      pool.query('SELECT * FROM simulation_results WHERE user_id = $1', [targetId]),
    ]);

    const hasRecords =
      progress.rows.length > 0 ||
      quizResults.rows.length > 0 ||
      simResults.rows.length > 0;

    if (hasRecords) {
      // Step 10-11 — archive before deletion
      const trainingData = {
        moduleProgress: progress.rows,
        quizResults: quizResults.rows,
        simulationResults: simResults.rows,
      };
      await pool.query(
        `INSERT INTO archived_accounts
           (original_user_id, email, name, role, department, training_data, deleted_by_id, deleted_by_email)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          target.id, target.email, target.name, target.role,
          target.department, JSON.stringify(trainingData),
          req.user.id, req.user.email,
        ]
      );
    }
    // 9A4 — no records: skip archival, proceed directly to deletion

    // Step 12 — permanently delete (CASCADE removes related records)
    await pool.query('DELETE FROM users WHERE id = $1', [targetId]);

    // Step 13 — audit log
    await pool.query(
      `INSERT INTO audit_log (action, actor_id, actor_email, target_id, target_email, details)
       VALUES ('user_deleted', $1, $2, $3, $4, $5)`,
      [
        req.user.id, req.user.email, target.id, target.email,
        JSON.stringify({ name: target.name, role: target.role, recordsArchived: hasRecords }),
      ]
    );

    res.json({
      message: `${target.name}'s account has been permanently deleted. ${hasRecords ? 'Training records archived for 7 years.' : 'No training records to archive.'}`,
      archived: hasRecords,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
