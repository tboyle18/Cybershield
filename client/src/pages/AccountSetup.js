import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiAlertTriangle, FiEye, FiEyeOff } from 'react-icons/fi';
import './AccountSetup.css';

export default function AccountSetup() {
  const navigate = useNavigate();
  const token = new URLSearchParams(window.location.search).get('token');

  const [email, setEmail]             = useState('');
  const [tokenValid, setTokenValid]   = useState(null); // null=loading, true, false
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [error, setError]             = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);

  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    fetch(`/api/enrollment/setup/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.email) { setEmail(data.email); setTokenValid(true); }
        else setTokenValid(false);
      })
      .catch(() => setTokenValid(false));
  }, [token]);

  const passwordRules = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'At least one uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'At least one number', ok: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!username.trim() || username.trim().length < 3) errs.username = 'Username must be at least 3 characters.';
    if (!passwordRules.every(r => r.ok)) errs.password = 'Password does not meet the requirements below.';
    if (password !== confirm) errs.confirm = 'Passwords do not match.';
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

    setFieldErrors({});
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/enrollment/setup/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          // 16A2 — username taken
          setFieldErrors({ username: data.error });
        } else {
          setError(data.error || 'Setup failed. Please try again.');
        }
        return;
      }
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (tokenValid === null) {
    return (
      <div className="setup-page">
        <div className="setup-card card">
          <div className="setup-logo">🛡️ CyberShield</div>
          <p className="setup-loading">Verifying your setup link…</p>
        </div>
      </div>
    );
  }

  // ── Invalid token ────────────────────────────────────────────────────────
  if (tokenValid === false) {
    return (
      <div className="setup-page">
        <div className="setup-card card">
          <div className="setup-logo">🛡️ CyberShield</div>
          <div className="setup-error-state">
            <FiAlertTriangle size={40} className="setup-error-icon" />
            <h2>Invalid Setup Link</h2>
            <p>This account setup link is invalid or has already been used. Contact your administrator to request a new enrollment.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="setup-page">
        <div className="setup-card card">
          <div className="setup-logo">🛡️ CyberShield</div>
          <div className="setup-success-state">
            <FiCheckCircle size={48} className="setup-success-icon" />
            <h2>Account Ready!</h2>
            <p>Your CyberShield account has been activated. Redirecting to the login page…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Setup form ───────────────────────────────────────────────────────────
  return (
    <div className="setup-page">
      <div className="setup-card card">
        <div className="setup-logo">🛡️ CyberShield</div>
        <h2>Complete Your Account Setup</h2>
        <p className="setup-subtitle">
          You've been enrolled by your administrator. Create your username and password to activate your account.
        </p>
        <div className="setup-email-badge">
          <span className="setup-email-label">Enrolled email</span>
          <strong>{email}</strong>
        </div>

        {error && <div className="setup-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="setup-form" noValidate>
          <div className="form-group">
            <label>Choose a Username</label>
            <input
              type="text"
              placeholder="e.g. jsmith"
              value={username}
              onChange={e => { setUsername(e.target.value); setFieldErrors(f => ({ ...f, username: '' })); }}
              autoFocus
            />
            {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
          </div>

          <div className="form-group">
            <label>Create a Password</label>
            <div className="password-input-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Choose a secure password"
                value={password}
                onChange={e => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: '' })); }}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            <div className="pw-rules">
              {passwordRules.map(r => (
                <div key={r.label} className={`pw-rule ${password.length > 0 ? (r.ok ? 'ok' : 'fail') : ''}`}>
                  <span className="pw-rule-dot" /> {r.label}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setFieldErrors(f => ({ ...f, confirm: '' })); }}
            />
            {fieldErrors.confirm && <span className="field-error">{fieldErrors.confirm}</span>}
          </div>

          <button type="submit" className="btn btn-primary setup-submit" disabled={loading}>
            {loading ? 'Activating Account…' : 'Activate My Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
