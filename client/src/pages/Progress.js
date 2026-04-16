import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiAward, FiDownload, FiCheckCircle, FiBook, FiTrendingUp } from 'react-icons/fi';
import './Progress.css';

const badges = [
  { id: 1, name: 'Phish Spotter', icon: '🎣', earned: true, desc: 'Completed Phishing Awareness module' },
  { id: 2, name: 'Key Keeper', icon: '🔐', earned: true, desc: 'Scored 80%+ on Password Security quiz' },
  { id: 3, name: 'Quick Learner', icon: '⚡', earned: true, desc: 'Completed a module in under 30 minutes' },
  { id: 4, name: 'Web Guardian', icon: '🌐', earned: false, desc: 'Complete the Safe Browsing module' },
  { id: 5, name: 'Mobile Defender', icon: '📱', earned: false, desc: 'Complete the Mobile Security module' },
  { id: 6, name: 'Privacy Pro', icon: '🛡️', earned: false, desc: 'Complete the Data Privacy module' },
  { id: 7, name: 'Perfect Score', icon: '🏅', earned: false, desc: 'Score 100% on any module quiz' },
  { id: 8, name: 'CyberShield Champion', icon: '🏆', earned: false, desc: 'Complete all 5 training modules' },
];

const modules = [
  { title: 'Phishing Awareness', progress: 100, score: 92, attempts: 1, status: 'completed' },
  { title: 'Password Security', progress: 75, score: 80, attempts: 2, status: 'in_progress' },
  { title: 'Safe Browsing', progress: 30, score: null, attempts: 0, status: 'in_progress' },
  { title: 'Mobile Device Security', progress: 0, score: null, attempts: 0, status: 'not_started' },
  { title: 'Data Privacy', progress: 0, score: null, attempts: 0, status: 'not_started' },
];

const quizHistory = [
  { module: 'Phishing Awareness', section: 'What is Phishing?', score: '2/2', points: 20, date: '2026-04-07' },
  { module: 'Phishing Awareness', section: 'Recognizing Phishing Emails', score: '2/2', points: 20, date: '2026-04-07' },
  { module: 'Password Security', section: 'Why Password Strength Matters', score: '2/2', points: 20, date: '2026-04-08' },
  { module: 'Password Security', section: 'Why Password Strength Matters', score: '1/2', points: 10, date: '2026-04-06' },
];

export default function Progress() {
  const { user } = useAuth();
  const earnedBadges = badges.filter(b => b.earned).length;
  const completedModules = modules.filter(m => m.status === 'completed').length;
  const overallProgress = Math.round(modules.reduce((a, m) => a + m.progress, 0) / modules.length);

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1>My Progress</h1>
        <p>Track your training completion, quiz scores, and achievements</p>
      </div>

      {/* Stats */}
      <div className="progress-stats">
        <div className="card prog-stat">
          <div className="prog-stat-icon blue"><FiBook /></div>
          <div><div className="prog-stat-num">{completedModules}/5</div><div className="prog-stat-label">Modules Complete</div></div>
        </div>
        <div className="card prog-stat">
          <div className="prog-stat-icon green"><FiTrendingUp /></div>
          <div><div className="prog-stat-num">{overallProgress}%</div><div className="prog-stat-label">Overall Progress</div></div>
        </div>
        <div className="card prog-stat">
          <div className="prog-stat-icon yellow"><FiAward /></div>
          <div><div className="prog-stat-num">{user?.points || 340}</div><div className="prog-stat-label">Total Points</div></div>
        </div>
        <div className="card prog-stat">
          <div className="prog-stat-icon purple"><FiCheckCircle /></div>
          <div><div className="prog-stat-num">{earnedBadges}/8</div><div className="prog-stat-label">Badges Earned</div></div>
        </div>
      </div>

      {/* Certificate Banner */}
      {completedModules === 5 && (
        <div className="cert-banner card">
          <div className="cert-info">
            <span>🎓</span>
            <div>
              <h3>Certificate Ready!</h3>
              <p>You've completed all 5 modules. Download your CyberShield completion certificate.</p>
            </div>
          </div>
          <button className="btn btn-primary"><FiDownload /> Download Certificate (PDF)</button>
        </div>
      )}

      {completedModules < 5 && (
        <div className="cert-progress-banner card">
          <span>🎓</span>
          <div>
            <h3>Complete all 5 modules to earn your certificate</h3>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: `${(completedModules / 5) * 100}%` }} />
            </div>
            <p>{completedModules}/5 modules complete</p>
          </div>
        </div>
      )}

      {/* Module Progress */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>Module Progress</h3>
        {modules.map((m, i) => (
          <div key={i} className="mod-prog-row">
            <div className="mod-prog-info">
              <span className="mod-prog-name">{m.title}</span>
              {m.score !== null && <span className="badge badge-success">Best Score: {m.score}%</span>}
              {m.status === 'not_started' && <span className="badge badge-info">Not Started</span>}
            </div>
            <div className="mod-prog-bar-wrap">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${m.progress}%` }} />
              </div>
              <span className="mod-prog-pct">{m.progress}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>Badges & Achievements</h3>
        <div className="badges-grid">
          {badges.map(b => (
            <div key={b.id} className={`badge-card ${b.earned ? 'earned' : 'locked'}`}>
              <span className="badge-emoji">{b.icon}</span>
              <div className="badge-name">{b.name}</div>
              <div className="badge-desc">{b.desc}</div>
              {b.earned && <div className="badge-earned-label"><FiCheckCircle /> Earned</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Quiz History */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Quiz History</h3>
        <table className="quiz-history-table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Section</th>
              <th>Score</th>
              <th>Points</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {quizHistory.map((h, i) => (
              <tr key={i}>
                <td>{h.module}</td>
                <td>{h.section}</td>
                <td><span className="badge badge-success">{h.score}</span></td>
                <td>+{h.points} pts</td>
                <td>{h.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
