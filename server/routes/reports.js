const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

function requireReporting(req, res, next) {
  requireAuth(req, res, () => {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Reporting access requires manager or admin role' });
    }
    next();
  });
}

// GET /api/reports/compliance
// Query: department, startDate, endDate, status (compliant|partial|non-compliant|all)
router.get('/compliance', requireReporting, async (req, res) => {
  const { department = '', startDate, endDate, status = 'all' } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }
  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ error: 'Start date must be before end date' });
  }

  try {
    // Fetch first two required modules by sort_order
    const modulesResult = await pool.query(
      'SELECT id, title FROM modules WHERE is_active = true ORDER BY sort_order LIMIT 2'
    );
    const [mod1, mod2] = modulesResult.rows;

    const params = [startDate, endDate];
    let deptClause = '';
    if (department && department !== 'all') {
      params.push(department);
      deptClause = `AND u.department = $${params.length}`;
    }

    const rows = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.department, u.created_at,
         ump1.completed_at  AS mod1_completed,
         ump2.completed_at  AS mod2_completed,
         sr.passed          AS sim_passed
       FROM users u
       LEFT JOIN user_module_progress ump1
         ON ump1.user_id = u.id AND ump1.module_id = $3
       LEFT JOIN user_module_progress ump2
         ON ump2.user_id = u.id AND ump2.module_id = $4
       LEFT JOIN LATERAL (
         SELECT passed FROM simulation_results
         WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1
       ) sr ON true
       WHERE u.is_active = true
         AND u.created_at BETWEEN $1 AND ($2::date + INTERVAL '1 day')
         ${deptClause}
       ORDER BY u.name`,
      [...params, mod1?.id, mod2?.id]
    );

    const employees = rows.rows.map(r => {
      const m1 = !!r.mod1_completed;
      const m2 = !!r.mod2_completed;
      const sim = r.sim_passed === true;
      const count = [m1, m2, sim].filter(Boolean).length;
      const complianceStatus = count === 3 ? 'compliant' : count === 0 ? 'non-compliant' : 'partial';

      return {
        id: r.id,
        name: r.name,
        email: r.email,
        department: r.department || '—',
        enrolled: r.created_at,
        module1: { title: mod1?.title || 'Module 1', complete: m1 },
        module2: { title: mod2?.title || 'Module 2', complete: m2 },
        simulation: { complete: r.sim_passed !== null, passed: sim },
        complianceStatus,
      };
    });

    const filtered = status === 'all'
      ? employees
      : employees.filter(e => e.complianceStatus === status);

    const summary = {
      total: filtered.length,
      compliant: filtered.filter(e => e.complianceStatus === 'compliant').length,
      partial: filtered.filter(e => e.complianceStatus === 'partial').length,
      nonCompliant: filtered.filter(e => e.complianceStatus === 'non-compliant').length,
    };

    // Log the report generation event
    await pool.query(
      `INSERT INTO audit_log (action, actor_id, actor_email, details)
       VALUES ('report_generated', $1, $2, $3)`,
      [
        req.user.id,
        req.user.email,
        JSON.stringify({ department, startDate, endDate, status, resultCount: filtered.length }),
      ]
    ).catch(() => {}); // non-fatal

    res.json({
      employees: filtered,
      summary,
      metadata: {
        department: department || 'All Departments',
        startDate,
        endDate,
        status,
        generatedAt: new Date().toISOString(),
        generatedBy: req.user.email,
        module1Title: mod1?.title || 'Module 1',
        module2Title: mod2?.title || 'Module 2',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
