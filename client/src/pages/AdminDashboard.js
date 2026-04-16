import React, { useState } from 'react';
import { FiUsers, FiAlertTriangle, FiCheckCircle, FiBarChart2, FiSearch, FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi';
import './AdminDashboard.css';

const users = [
  { id: 1, name: 'Alex Johnson', email: 'alex@company.com', role: 'employee', dept: 'IT', progress: 40, lastActive: '2026-04-09', status: 'active', quizFails: 0 },
  { id: 2, name: 'Sarah Chen', email: 'sarah@company.com', role: 'employee', dept: 'Engineering', progress: 100, lastActive: '2026-04-09', status: 'active', quizFails: 0 },
  { id: 3, name: 'Marcus Williams', email: 'marcus@company.com', role: 'employee', dept: 'Sales', progress: 96, lastActive: '2026-04-08', status: 'active', quizFails: 1 },
  { id: 4, name: 'Jordan Kim', email: 'jordan@company.com', role: 'employee', dept: 'Finance', progress: 40, lastActive: '2026-03-20', status: 'overdue', quizFails: 3 },
  { id: 5, name: 'Taylor Brooks', email: 'taylor@company.com', role: 'employee', dept: 'Marketing', progress: 20, lastActive: '2026-03-15', status: 'overdue', quizFails: 2 },
  { id: 6, name: 'Chris Martinez', email: 'chris@company.com', role: 'manager', dept: 'Legal', progress: 20, lastActive: '2026-04-01', status: 'active', quizFails: 0 },
];

export default function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || u.status === filter || (filter === 'alert' && u.quizFails >= 2);
    return matchSearch && matchFilter;
  });

  const overdue = users.filter(u => u.status === 'overdue').length;
  const alerts = users.filter(u => u.quizFails >= 2).length;
  const avgProgress = Math.round(users.reduce((a, u) => a + u.progress, 0) / users.length);
  const completed = users.filter(u => u.progress === 100).length;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users, monitor compliance, and track training progress</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <FiUserPlus /> Add User
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
          <strong>{alerts} user{alerts > 1 ? 's' : ''} flagged</strong> — multiple quiz failures or significantly behind on progress. Review below.
        </div>
      )}

      {/* User Table */}
      <div className="card admin-table-card">
        <div className="admin-table-header">
          <div className="admin-search">
            <FiSearch />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
            />
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
              <th>User</th>
              <th>Department</th>
              <th>Role</th>
              <th>Progress</th>
              <th>Last Active</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className={u.quizFails >= 2 ? 'alert-row' : ''}>
                <td className="user-cell">
                  <div className="admin-user-avatar">{u.name.split(' ').map(n => n[0]).join('')}</div>
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
                    <button className="action-btn edit" title="Edit user"><FiEdit2 /></button>
                    <button className="action-btn delete" title="Deactivate user"><FiTrash2 /></button>
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card card" onClick={e => e.stopPropagation()}>
            <h3>Add New User</h3>
            <div className="form-group"><label>Full Name</label><input type="text" placeholder="John Smith" /></div>
            <div className="form-group"><label>Email</label><input type="email" placeholder="john@company.com" /></div>
            <div className="form-group">
              <label>Role</label>
              <select>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="trainer">Security Trainer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group"><label>Department</label><input type="text" placeholder="Engineering" /></div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowAddModal(false)}>Add User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
