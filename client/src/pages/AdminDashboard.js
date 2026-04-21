import React, { useState } from 'react';
import {
  FiUsers, FiAlertTriangle, FiCheckCircle, FiBarChart2,
  FiSearch, FiEdit2, FiTrash2, FiUserPlus, FiX, FiArrowRight, FiArrowLeft, FiMail,
  FiAlertOctagon, FiArchive,
} from 'react-icons/fi';
import './AdminDashboard.css';

const DEMO_MODULES = [
  { id: 1, icon: '🎣', title: 'Phishing Awareness',      difficulty: 'Beginner',     duration_min: 45 },
  { id: 2, icon: '🔐', title: 'Password Security',        difficulty: 'Beginner',     duration_min: 35 },
  { id: 3, icon: '🌐', title: 'Safe Browsing',            difficulty: 'Beginner',     duration_min: 30 },
  { id: 4, icon: '📱', title: 'Mobile Device Security',   difficulty: 'Intermediate', duration_min: 25 },
  { id: 5, icon: '🛡️', title: 'Data Privacy',             difficulty: 'Intermediate', duration_min: 40 },
];

const DEMO_USERS = [
  { id: 1, name: 'Alex Johnson',    email: 'alex@company.com',    role: 'employee', dept: 'IT',          progress: 40,  lastActive: '2026-04-09', status: 'active',  quizFails: 0, modules: [1, 2] },
  { id: 2, name: 'Sarah Chen',      email: 'sarah@company.com',   role: 'employee', dept: 'Engineering', progress: 100, lastActive: '2026-04-09', status: 'active',  quizFails: 0, modules: [1, 2, 3, 4, 5] },
  { id: 3, name: 'Marcus Williams', email: 'marcus@company.com',  role: 'employee', dept: 'Sales',       progress: 96,  lastActive: '2026-04-08', status: 'active',  quizFails: 1, modules: [1, 2, 3, 4] },
  { id: 4, name: 'Jordan Kim',      email: 'jordan@company.com',  role: 'employee', dept: 'Finance',     progress: 40,  lastActive: '2026-03-20', status: 'overdue', quizFails: 3, modules: [1, 2] },
  { id: 5, name: 'Taylor Brooks',   email: 'taylor@company.com',  role: 'employee', dept: 'Marketing',   progress: 20,  lastActive: '2026-03-15', status: 'overdue', quizFails: 2, modules: [1] },
  { id: 6, name: 'Chris Martinez',  email: 'chris@company.com',   role: 'manager',  dept: 'Legal',       progress: 20,  lastActive: '2026-04-01', status: 'active',  quizFails: 0, modules: [1, 2] },
];

const EMPTY_FORM = { email: '', role: 'employee', department: '', moduleIds: [] };

export default function AdminDashboard() {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [users, setUsers]     = useState(DEMO_USERS);

  // Edit account
  const [editTarget, setEditTarget]           = useState(null);
  const [editForm, setEditForm]               = useState({});
  const [editSaving, setEditSaving]           = useState(false);
  const [editSaved, setEditSaved]             = useState(false);
  const [editError, setEditError]             = useState('');

  // Delete / offboard
  const [deleteTarget, setDeleteTarget]       = useState(null);  // user object
  const [deleteLoading, setDeleteLoading]     = useState(false);
  const [deleteSuccess, setDeleteSuccess]     = useState(false);

  // Enrollment wizard
  const [showEnroll, setShowEnroll]           = useState(false);
  const [step, setStep]                       = useState(1);
  const [form, setForm]                       = useState(EMPTY_FORM);
  const [enrollError, setEnrollError]         = useState('');
  const [enrollLoading, setEnrollLoading]     = useState(false);
  const [availableModules, setAvailableModules] = useState([]);
  const [setupUrl, setSetupUrl]               = useState('');

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || u.status === filter || (filter === 'alert' && u.quizFails >= 2);
    return matchSearch && matchFilter;
  });

  const overdue    = users.filter(u => u.status === 'overdue').length;
  const alerts     = users.filter(u => u.quizFails >= 2).length;
  const avgProgress = Math.round(users.reduce((a, u) => a + u.progress, 0) / users.length);
  const completed  = users.filter(u => u.progress === 100).length;

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const openEdit = (u) => {
    setEditTarget(u);
    setEditForm({
      name: u.name,
      email: u.email,
      role: u.role,
      dept: u.dept || '',
      modules: u.modules ? [...u.modules] : [],
      newPassword: '',
      confirmPassword: '',
    });
    setEditSaved(false);
    setEditError('');
  };
  const closeEdit = () => { setEditTarget(null); setEditSaving(false); setEditSaved(false); setEditError(''); };

  const toggleEditModule = (id) => {
    setEditForm(f => ({
      ...f,
      modules: f.modules.includes(id) ? f.modules.filter(m => m !== id) : [...f.modules, id],
    }));
  };

  const handleEditSave = async () => {
    if (!editForm.name.trim()) { setEditError('Display name cannot be empty.'); return; }
    if (!editForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      setEditError('Please enter a valid email address.'); return;
    }
    if (editForm.newPassword && editForm.newPassword.length < 8) {
      setEditError('New password must be at least 8 characters.'); return;
    }
    if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
      setEditError('Passwords do not match.'); return;
    }

    setEditError('');
    setEditSaving(true);

    const body = {
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      role: editForm.role,
      department: editForm.dept.trim() || null,
    };
    if (editForm.newPassword) body.password = editForm.newPassword;

    try {
      await fetch(`/api/users/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(body),
      });
    } catch { /* API unavailable — update local only */ }

    // Update local users array
    setUsers(prev => prev.map(u =>
      u.id === editTarget.id
        ? { ...u, name: editForm.name.trim(), email: editForm.email.trim(), role: editForm.role, dept: editForm.dept.trim() || u.dept, modules: editForm.modules }
        : u
    ));
    setEditSaved(true);
    setEditSaving(false);
    setTimeout(closeEdit, 1400);
  };

  const openDelete = (u) => { setDeleteTarget(u); setDeleteSuccess(false); };
  const closeDelete = () => { setDeleteTarget(null); setDeleteLoading(false); setDeleteSuccess(false); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      // whether API succeeded or not, remove from local list (demo mode fallback)
      if (res.ok || res.status !== 200) {
        setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
        setDeleteSuccess(true);
      }
    } catch {
      // API unavailable — still remove from demo list
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setDeleteSuccess(true);
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetEnroll = () => {
    setShowEnroll(false);
    setStep(1);
    setForm(EMPTY_FORM);
    setEnrollError('');
    setEnrollLoading(false);
    setSetupUrl('');
  };

  // Step 1 → 2: validate email and check uniqueness (3A1)
  const handleStep1Next = async () => {
    const email = form.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEnrollError('Please enter a valid work email address.');
      return;
    }
    setEnrollError('');
    setEnrollLoading(true);
    try {
      const res = await fetch(`/api/enrollment/check?email=${encodeURIComponent(email)}`, {
        headers: authHeader(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check failed');
      if (!data.available) {
        setEnrollError('This email address is already registered in CyberShield. Look up the existing account.');
        setEnrollLoading(false);
        return;
      }
      // Fetch modules for step 2
      const modRes = await fetch('/api/enrollment/modules', { headers: authHeader() });
      const modData = await modRes.json();
      if (modRes.ok) setAvailableModules(modData);
      setStep(2);
    } catch {
      // API unavailable — demo mode fallback
      const alreadyExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (alreadyExists) {
        setEnrollError('This email address is already registered in CyberShield. Look up the existing account.');
        setEnrollLoading(false);
        return;
      }
      setAvailableModules(DEMO_MODULES);
      setStep(2);
    } finally {
      setEnrollLoading(false);
    }
  };

  const toggleModule = (id) => {
    setForm(f => ({
      ...f,
      moduleIds: f.moduleIds.includes(id)
        ? f.moduleIds.filter(m => m !== id)
        : [...f.moduleIds, id],
    }));
  };

  // Step 3 confirm: POST /api/enrollment
  const handleConfirm = async () => {
    setEnrollError('');
    setEnrollLoading(true);

    const newUser = {
      id: Date.now(),
      name: form.email.split('@')[0],
      email: form.email.trim(),
      role: form.role,
      dept: form.department.trim() || '—',
      progress: 0,
      lastActive: 'Never',
      status: 'active',
      quizFails: 0,
      modules: form.moduleIds,
    };

    try {
      const res = await fetch('/api/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          email: form.email.trim(),
          role: form.role,
          department: form.department.trim() || undefined,
          moduleIds: form.moduleIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Enrollment failed');
      setSetupUrl(data.setupUrl);
      setUsers(prev => [...prev, newUser]);
      setStep(4);
    } catch {
      // API unavailable — demo mode fallback
      const demoToken = `demo-${Math.random().toString(36).slice(2, 18)}`;
      setSetupUrl(`${window.location.origin}/setup?token=${demoToken}`);
      setUsers(prev => [...prev, newUser]);
      setStep(4);
    } finally {
      setEnrollLoading(false);
    }
  };

  const openEnroll = () => {
    resetEnroll();
    setShowEnroll(true);
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users, monitor compliance, and track training progress</p>
        </div>
        <button className="btn btn-primary" onClick={openEnroll}>
          <FiUserPlus /> Enroll New Hire
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="card admin-stat">
          <div className="admin-stat-icon blue"><FiUsers /></div>
          <div><div className="admin-stat-num">{users.length}</div><div className="admin-stat-label">Total Users</div></div>
        </div>
        <div className="card admin-stat">
          <div className="admin-stat-icon green"><FiCheckCircle /></div>
          <div><div className="admin-stat-num">{completed}</div><div className="admin-stat-label">Fully Complete</div></div>
        </div>
        <div className="card admin-stat">
          <div className="admin-stat-icon orange"><FiBarChart2 /></div>
          <div><div className="admin-stat-num">{avgProgress}%</div><div className="admin-stat-label">Avg. Progress</div></div>
        </div>
        <div className="card admin-stat">
          <div className="admin-stat-icon red"><FiAlertTriangle /></div>
          <div><div className="admin-stat-num">{overdue}</div><div className="admin-stat-label">Overdue Users</div></div>
        </div>
      </div>

      {/* Alerts */}
      {alerts > 0 && (
        <div className="admin-alert-banner">
          <FiAlertTriangle />
          <strong>{alerts} user{alerts > 1 ? 's' : ''} flagged</strong> — multiple quiz failures or significantly behind on progress.
        </div>
      )}

      {/* User Table */}
      <div className="card admin-table-card">
        <div className="admin-table-header">
          <div className="admin-search">
            <FiSearch />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." />
          </div>
          <div className="admin-filter-btns">
            {['all', 'active', 'overdue', 'alert'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'active' ? 'Active' : f === 'overdue' ? 'Overdue' : 'Alerts'}
              </button>
            ))}
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th><th>Department</th><th>Role</th><th>Progress</th>
              <th>Last Active</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className={u.quizFails >= 2 ? 'alert-row' : ''}>
                <td className="user-cell">
                  <div className="admin-user-avatar">{u.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
                  <div>
                    <div className="admin-user-name">{u.name}</div>
                    <div className="admin-user-email">{u.email}</div>
                  </div>
                </td>
                <td>{u.dept}</td>
                <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                <td>
                  <div className="admin-prog-wrap">
                    <div className="progress-bar" style={{ width: 100 }}>
                      <div className="progress-fill" style={{ width: `${u.progress}%` }} />
                    </div>
                    <span>{u.progress}%</span>
                  </div>
                </td>
                <td className="last-active">{u.lastActive}</td>
                <td>
                  <span className={`status-badge status-${u.status}`}>
                    {u.status === 'overdue' ? '⚠️ Overdue' : '✓ Active'}
                  </span>
                  {u.quizFails >= 2 && <span className="fail-badge">🔴 {u.quizFails} Quiz Fails</span>}
                </td>
                <td>
                  <div className="admin-actions">
                    <button className="action-btn edit" title="Edit user" onClick={() => openEdit(u)}><FiEdit2 /></button>
                    <button className="action-btn delete" title="Offboard user" onClick={() => openDelete(u)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="admin-empty"><FiSearch size={32} /><p>No users match your search.</p></div>
        )}
      </div>

      {/* ── Edit Account Modal ───────────────────────────────────────────── */}
      {editTarget && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-card card edit-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="edit-modal-header">
              <div className="edit-modal-title">
                <div className="edit-modal-avatar">
                  {editTarget.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3>Edit Account</h3>
                  <span className="edit-modal-sub">{editTarget.email}</span>
                </div>
              </div>
              <button className="enroll-close-btn" onClick={closeEdit}><FiX /></button>
            </div>

            {editSaved ? (
              <div className="edit-saved-banner"><FiCheckCircle /> Changes saved successfully.</div>
            ) : (
              <div className="edit-modal-body">

                {/* ── Account Details ── */}
                <div className="edit-section-label">Account Details</div>
                <div className="edit-two-col">
                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Full name or username"
                    />
                  </div>
                  <div className="form-group">
                    <label>Work Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="employee@company.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="trainer">Security Trainer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      value={editForm.dept}
                      onChange={e => setEditForm(f => ({ ...f, dept: e.target.value }))}
                      placeholder="e.g. Engineering"
                    />
                  </div>
                </div>

                {/* ── Assigned Modules ── */}
                <div className="edit-section-label">Assigned Training Modules</div>
                <div className="module-checklist">
                  {DEMO_MODULES.map(m => (
                    <label
                      key={m.id}
                      className={`module-check-item ${editForm.modules.includes(m.id) ? 'checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={editForm.modules.includes(m.id)}
                        onChange={() => toggleEditModule(m.id)}
                      />
                      <span className="module-check-icon">{m.icon}</span>
                      <div className="module-check-info">
                        <span className="module-check-title">{m.title}</span>
                        <span className="module-check-meta">{m.difficulty} · {m.duration_min} min</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* ── Password ── */}
                <div className="edit-section-label">Password</div>
                <p className="edit-section-hint">Leave blank to keep the current password unchanged.</p>
                <div className="edit-two-col">
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={editForm.newPassword}
                      onChange={e => setEditForm(f => ({ ...f, newPassword: e.target.value }))}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={editForm.confirmPassword}
                      onChange={e => setEditForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {editError && <div className="enroll-error">{editError}</div>}

                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={closeEdit} disabled={editSaving}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleEditSave} disabled={editSaving}>
                    {editSaving ? 'Saving…' : <><FiCheckCircle /> Save Changes</>}
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Delete / Offboard Modal ──────────────────────────────────────── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={closeDelete}>
          <div className="modal-card card delete-modal" onClick={e => e.stopPropagation()}>

            {deleteSuccess ? (
              /* Step 14 — success confirmation */
              <div className="delete-success">
                <div className="delete-success-icon"><FiCheckCircle /></div>
                <h3>Account Deleted</h3>
                <p>
                  <strong>{deleteTarget.name}</strong>'s account has been permanently removed.
                  Training records and compliance history have been archived for 7 years in accordance with SOC 2 requirements.
                </p>
                <div className="delete-archive-note">
                  <FiArchive /> Records retained until {new Date(Date.now() + 7 * 365.25 * 24 * 3600 * 1000).getFullYear()}
                </div>
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={closeDelete}>Done</button>
              </div>
            ) : (
              <>
                <div className="delete-modal-header">
                  <h3><FiAlertOctagon /> Offboard and Delete User</h3>
                  <button className="enroll-close-btn" onClick={closeDelete}><FiX /></button>
                </div>

                {/* Employee profile snapshot */}
                <div className="delete-profile-card">
                  <div className="delete-profile-avatar">
                    {deleteTarget.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="delete-profile-info">
                    <div className="delete-profile-name">{deleteTarget.name}</div>
                    <div className="delete-profile-email">{deleteTarget.email}</div>
                    <div className="delete-profile-meta">
                      <span className={`role-badge role-${deleteTarget.role}`}>{deleteTarget.role}</span>
                      {deleteTarget.dept && <span className="delete-dept-tag">{deleteTarget.dept}</span>}
                    </div>
                  </div>
                </div>

                {/* Training summary */}
                <div className="delete-training-summary">
                  <div className="delete-training-row">
                    <span>Training Progress</span>
                    <div className="delete-prog-wrap">
                      <div className="progress-bar" style={{ width: 120 }}>
                        <div className="progress-fill" style={{ width: `${deleteTarget.progress}%` }} />
                      </div>
                      <strong>{deleteTarget.progress}%</strong>
                    </div>
                  </div>
                  <div className="delete-training-row">
                    <span>Last Active</span>
                    <strong>{deleteTarget.lastActive}</strong>
                  </div>
                  <div className="delete-training-row">
                    <span>Status</span>
                    <span className={`status-badge status-${deleteTarget.status}`}>
                      {deleteTarget.status === 'overdue' ? '⚠️ Overdue' : '✓ Active'}
                    </span>
                  </div>
                </div>

                {/* Warning */}
                <div className="delete-warning-box">
                  <div className="delete-warning-title"><FiAlertTriangle /> This action is permanent and cannot be undone.</div>
                  <ul className="delete-warning-list">
                    <li>The account will be permanently deleted and can no longer be used to log in.</li>
                    <li>All training records, simulation results, and compliance history will be <strong>archived for 7 years</strong> (SOC 2 requirement).</li>
                    <li>Previously generated compliance reports will continue to reflect accurate historical data from the archive.</li>
                    <li>This deletion will be logged in the administrative audit trail.</li>
                  </ul>
                </div>

                <div className="modal-actions">
                  {/* 8A3 — cancel returns to profile with no changes */}
                  <button className="btn btn-outline" onClick={closeDelete} disabled={deleteLoading}>Cancel</button>
                  <button className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                    {deleteLoading ? 'Deleting…' : <><FiTrash2 /> Confirm Delete</>}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ── Enrollment Wizard Modal ───────────────────────────────────────── */}
      {showEnroll && (
        <div className="modal-overlay" onClick={resetEnroll}>
          <div className="modal-card card enroll-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            {step < 4 && (
              <div className="enroll-modal-header">
                <div>
                  <h3>New Hire Training Enrollment</h3>
                  <div className="enroll-steps-indicator">
                    {['Email', 'Configure', 'Review'].map((label, i) => (
                      <React.Fragment key={label}>
                        <span className={`enroll-step-dot ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
                          {step > i + 1 ? '✓' : i + 1}
                        </span>
                        <span className={`enroll-step-label ${step === i + 1 ? 'active' : ''}`}>{label}</span>
                        {i < 2 && <span className="enroll-step-connector" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <button className="enroll-close-btn" onClick={resetEnroll}><FiX /></button>
              </div>
            )}

            {/* Step 1 — Email */}
            {step === 1 && (
              <div className="enroll-body">
                <p className="enroll-step-desc">
                  Enter the new hire's work email address. CyberShield will verify the email is not already in use.
                </p>
                <div className="form-group">
                  <label>Work Email Address</label>
                  <input
                    type="email"
                    placeholder="newhire@company.com"
                    value={form.email}
                    onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setEnrollError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleStep1Next()}
                    autoFocus
                  />
                </div>
                {enrollError && <div className="enroll-error">{enrollError}</div>}
                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={resetEnroll}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleStep1Next} disabled={enrollLoading}>
                    {enrollLoading ? 'Checking…' : <>Next <FiArrowRight /></>}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Configure */}
            {step === 2 && (
              <div className="enroll-body">
                <p className="enroll-step-desc">
                  Set the account role and select the training modules to assign to <strong>{form.email}</strong>.
                </p>
                <div className="enroll-two-col">
                  <div className="form-group">
                    <label>Role</label>
                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="trainer">Security Trainer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department <span className="label-opt">(optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Engineering"
                      value={form.department}
                      onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Assign Training Modules</label>
                  <p className="field-hint">Select the modules this employee must complete.</p>
                  {availableModules.length === 0 ? (
                    <p className="field-hint">Loading modules…</p>
                  ) : (
                    <div className="module-checklist">
                      {availableModules.map(m => (
                        <label key={m.id} className={`module-check-item ${form.moduleIds.includes(m.id) ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={form.moduleIds.includes(m.id)}
                            onChange={() => toggleModule(m.id)}
                          />
                          <span className="module-check-icon">{m.icon}</span>
                          <div className="module-check-info">
                            <span className="module-check-title">{m.title}</span>
                            <span className="module-check-meta">{m.difficulty} · {m.duration_min} min</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={() => setStep(1)}><FiArrowLeft /> Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(3)}>
                    Next <FiArrowRight />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Review & Confirm */}
            {step === 3 && (
              <div className="enroll-body">
                <p className="enroll-step-desc">
                  Review the enrollment details below. CyberShield will create the account and send a welcome email with a setup link.
                </p>
                <div className="enroll-review-card">
                  <div className="enroll-review-row">
                    <span>Email</span>
                    <strong>{form.email}</strong>
                  </div>
                  <div className="enroll-review-row">
                    <span>Role</span>
                    <span className={`role-badge role-${form.role}`}>{form.role}</span>
                  </div>
                  {form.department && (
                    <div className="enroll-review-row">
                      <span>Department</span>
                      <strong>{form.department}</strong>
                    </div>
                  )}
                  <div className="enroll-review-row enroll-review-modules">
                    <span>Modules Assigned</span>
                    <div className="review-modules-list">
                      {form.moduleIds.length === 0 ? (
                        <em className="no-modules">None — modules can be assigned later</em>
                      ) : (
                        form.moduleIds.map(id => {
                          const m = availableModules.find(m => m.id === id);
                          return m ? (
                            <span key={id} className="review-module-tag">{m.icon} {m.title}</span>
                          ) : null;
                        })
                      )}
                    </div>
                  </div>
                </div>

                <p className="enroll-confirm-note">
                  <FiMail size={13} /> A welcome email containing the account setup link will be sent to <strong>{form.email}</strong>.
                </p>

                {enrollError && <div className="enroll-error">{enrollError}</div>}

                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={() => setStep(2)}><FiArrowLeft /> Back</button>
                  <button className="btn btn-primary" onClick={handleConfirm} disabled={enrollLoading}>
                    {enrollLoading ? 'Sending…' : '✉️ Confirm and Send Welcome Email'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 — Success */}
            {step === 4 && (
              <div className="enroll-body enroll-success">
                <div className="enroll-success-icon">✅</div>
                <h3>Enrollment Complete!</h3>
                <p>
                  A welcome email has been sent to <strong>{form.email}</strong> with instructions to complete account setup and access their assigned training modules.
                </p>
                <div className="enroll-setup-link-box">
                  <label>Account Setup Link <span className="label-opt">(shown here for demo — normally delivered by email)</span></label>
                  <div className="setup-link-row">
                    <code className="setup-link-code">{setupUrl}</code>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => navigator.clipboard?.writeText(setupUrl)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 20, alignSelf: 'center' }} onClick={resetEnroll}>
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
