import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Demo login — swap with real API call when backend is ready
    await new Promise(r => setTimeout(r, 800));

    if (form.email === 'admin@cybershield.com' && form.password === 'admin123') {
      login({ name: 'Admin User', email: form.email, role: 'admin', points: 1500, badges: 8 }, 'demo-admin-token');
      navigate('/admin');
    } else if (form.email && form.password.length >= 6) {
      login({ name: 'Alex Johnson', email: form.email, role: 'employee', points: 340, badges: 3 }, 'demo-user-token');
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. (Demo: any email + 6+ char password)');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <FiShield className="brand-icon" />
          <span>CyberShield</span>
        </div>
        <h1>Defend Against<br />Digital Threats</h1>
        <p>Learn to identify phishing attacks, protect your data, and become a cybersecurity champion through interactive training.</p>
        <div className="login-stats">
          <div className="stat"><span>10,000+</span><label>Users Trained</label></div>
          <div className="stat"><span>95%</span><label>Threat Detection Rate</label></div>
          <div className="stat"><span>5</span><label>Training Modules</label></div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <FiShield className="card-icon" />
            <h2>Welcome Back</h2>
            <p>Sign in to your CyberShield account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="password-label-row">
                <label>Password</label>
                <button type="button" className="show-pass-btn" onClick={() => setShowPass(s => !s)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-divider"><span>or</span></div>

          <p className="login-register">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>

          <div className="demo-hint">
            <strong>Demo:</strong> admin@cybershield.com / admin123 &nbsp;|&nbsp; any email / 6+ chars
          </div>
        </div>
      </div>
    </div>
  );
}
