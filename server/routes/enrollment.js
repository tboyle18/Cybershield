const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/enrollment/check?email=  (admin only — step 3A1)
router.get('/check', requireAdmin, async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const result = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    res.json({ available: result.rows.length === 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/enrollment/modules  (admin only — module selection list)
router.get('/modules', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, icon, difficulty, duration_min FROM modules WHERE is_active = true ORDER BY sort_order'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/enrollment  (admin only — create enrolled user, assign modules, send welcome)
router.post('/', requireAdmin, async (req, res) => {
  const { email, role = 'employee', department, moduleIds = [] } = req.body;

  if (!email) return res.status(400).json({ error: 'Work email is required' });
  if (!['employee', 'manager', 'trainer', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    // 3A1 — email uniqueness check
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'This email address is already registered in CyberShield.' });
    }

    const setupToken = crypto.randomBytes(32).toString('hex');
    const nameplaceholder = email.split('@')[0];

    const userResult = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department, is_active, setup_token)
       VALUES ($1, $2, $3, $4, $5, false, $6)
       RETURNING id, email, role`,
      [nameplaceholder, email.toLowerCase(), '__pending__', role, department || null, setupToken]
    );
    const user = userResult.rows[0];

    // Assign selected modules
    if (moduleIds.length > 0) {
      const validModules = await pool.query(
        'SELECT id FROM modules WHERE id = ANY($1) AND is_active = true',
        [moduleIds]
      );
      for (const mod of validModules.rows) {
        await pool.query(
          `INSERT INTO user_module_progress (user_id, module_id, progress_pct)
           VALUES ($1, $2, 0) ON CONFLICT (user_id, module_id) DO NOTHING`,
          [user.id, mod.id]
        );
      }
    }

    // Log enrollment event
    await pool.query(
      `INSERT INTO notifications (user_id, type, message)
       VALUES ($1, 'enrollment', $2)`,
      [user.id, `Account enrolled by admin. Welcome email sent to ${email}.`]
    );

    const setupUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/setup?token=${setupToken}`;
    console.log(`[ENROLLMENT] Welcome email → ${email}`);
    console.log(`[ENROLLMENT] Setup URL: ${setupUrl}`);

    res.status(201).json({
      message: 'User enrolled successfully. Welcome email sent.',
      setupUrl,
      userId: user.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/enrollment/setup/:token  (public — validate token for setup page)
router.get('/setup/:token', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT email FROM users WHERE setup_token = $1 AND is_active = false',
      [req.params.token]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'This setup link is invalid or has already been used.' });
    }
    res.json({ email: result.rows[0].email });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/enrollment/setup/:token  (public — complete account setup)
router.post('/setup/:token', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one number' });
  }

  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE setup_token = $1 AND is_active = false',
      [req.params.token]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'This setup link is invalid or has already been used.' });
    }
    const userId = userResult.rows[0].id;

    // 16A2 — username uniqueness check
    const nameCheck = await pool.query(
      'SELECT id FROM users WHERE LOWER(name) = LOWER($1) AND id != $2',
      [username.trim(), userId]
    );
    if (nameCheck.rows.length > 0) {
      return res.status(409).json({ error: 'This username is already taken. Please choose a different one.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const updated = await pool.query(
      `UPDATE users
       SET name = $1, password_hash = $2, is_active = true, setup_token = NULL, updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, role`,
      [username.trim(), hashed, userId]
    );

    res.json({ message: 'Account setup complete. You can now log in.', user: updated.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
