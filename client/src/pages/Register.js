import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield, FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'employee' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    login({ name: form.name, email: form.email, role: form.role, points: 0, badges: 0 }, 'demo-new-user-token');
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand"><FiShield className="brand-icon" /><span>CyberShield</span></div>
        <h1>Start Your<br />Security Journey</h1>
        <p>Join thousands of users building cybersecurity awareness skills through interactive training modules and real-world simulations.</p>
        <div className="login-stats">
          <div className="stat"><span>Free</span><label>To Get Started</label></div>
          <div className="stat"><span>5</span><label>Core Modules</label></div>
          <div className="stat"><span>Cert</span><label>On Completion</label></div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <FiShield className="card-icon" />
            <h2>Create Account</h2>
            <p>Join CyberShield today</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-icon-wrap">
                <FiUser className="input-icon" />
                <input type="text" placeholder="John Smith" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" />
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>

            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="employee">Employee</option>
                <option value="manager">Manager / Compliance Officer</option>
                <option value="trainer">Security Trainer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" className="show-pass-btn" onClick={() => setShowPass(s => !s)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input type="password" placeholder="Repeat password" value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="login-divider"><span>or</span></div>
          <p className="login-register">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
