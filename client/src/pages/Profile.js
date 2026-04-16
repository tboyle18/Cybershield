import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiUser, FiLock, FiBell, FiShield, FiSave } from 'react-icons/fi';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });
  const [notifications, setNotifications] = useState({
    moduleReminders: true,
    newContent: true,
    quizResults: true,
    weeklyDigest: false,
  });
  const [mfa, setMfa] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="profile-grid">
        {/* Account Info */}
        <div className="card profile-card">
          <div className="profile-card-title"><FiUser /> Account Information</div>
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div className="profile-name">{user?.name}</div>
              <div className="profile-role">{user?.role || 'Employee'}</div>
            </div>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>

          <button className="btn btn-primary save-btn" onClick={handleSave}>
            <FiSave /> {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Password */}
        <div className="card profile-card">
          <div className="profile-card-title"><FiLock /> Change Password</div>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" placeholder="••••••••" value={form.currentPassword}
              onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" placeholder="Min. 8 characters" value={form.newPassword}
              onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} />
          </div>
          <button className="btn btn-outline save-btn" onClick={handleSave}>Update Password</button>
        </div>

        {/* Notifications */}
        <div className="card profile-card">
          <div className="profile-card-title"><FiBell /> Notification Preferences</div>
          {Object.entries(notifications).map(([key, val]) => (
            <div key={key} className="toggle-row">
              <div>
                <div className="toggle-label">{key === 'moduleReminders' ? 'Module Reminders' : key === 'newContent' ? 'New Content Alerts' : key === 'quizResults' ? 'Quiz Result Notifications' : 'Weekly Digest'}</div>
                <div className="toggle-desc">{key === 'moduleReminders' ? 'Get reminded about incomplete or overdue modules' : key === 'newContent' ? 'Be notified when new training content is added' : key === 'quizResults' ? 'Receive notifications after quiz submissions' : 'Weekly summary of your training progress'}</div>
              </div>
              <button className={`toggle-switch ${val ? 'on' : ''}`} onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}>
                <span className="toggle-thumb" />
              </button>
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="card profile-card">
          <div className="profile-card-title"><FiShield /> Security Settings</div>

          <div className="toggle-row">
            <div>
              <div className="toggle-label">Multi-Factor Authentication</div>
              <div className="toggle-desc">Add an extra layer of security to your account with a verification code</div>
            </div>
            <button className={`toggle-switch ${mfa ? 'on' : ''}`} onClick={() => setMfa(m => !m)}>
              <span className="toggle-thumb" />
            </button>
          </div>

          <div className="toggle-row">
            <div>
              <div className="toggle-label">Dark Mode</div>
              <div className="toggle-desc">Switch between light and dark interface theme</div>
            </div>
            <button className={`toggle-switch ${theme === 'dark' ? 'on' : ''}`} onClick={toggleTheme}>
              <span className="toggle-thumb" />
            </button>
          </div>

          <div className="security-info">
            <FiShield />
            <div>
              <div className="si-label">Last login</div>
              <div className="si-val">April 9, 2026 at 9:00 AM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
