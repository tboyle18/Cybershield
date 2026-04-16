import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiBook, FiAward, FiShield, FiTrendingUp,
  FiCheckCircle, FiClock, FiAlertTriangle, FiArrowRight
} from 'react-icons/fi';
import './Dashboard.css';

const modules = [
  { id: 1, title: 'Phishing Awareness', progress: 100, status: 'completed', icon: '🎣' },
  { id: 2, title: 'Password Security', progress: 75, status: 'in_progress', icon: '🔐' },
  { id: 3, title: 'Safe Browsing', progress: 30, status: 'in_progress', icon: '🌐' },
  { id: 4, title: 'Mobile Device Security', progress: 0, status: 'not_started', icon: '📱' },
  { id: 5, title: 'Data Privacy', progress: 0, status: 'not_started', icon: '🛡️' },
];

const recentActivity = [
  { icon: '✅', text: 'Completed Phishing Awareness Module', time: '2 hours ago' },
  { icon: '🏆', text: 'Earned "Phish Spotter" badge', time: '2 hours ago' },
  { icon: '📝', text: 'Quiz score: 9/10 on Password Security', time: '1 day ago' },
  { icon: '🔍', text: 'Submitted suspicious email for analysis', time: '2 days ago' },
];

const notifications = [
  { type: 'warning', text: 'Password Security module deadline in 3 days' },
  { type: 'info', text: 'New article added to Knowledge Hub' },
  { type: 'success', text: 'Certificate available: Phishing Awareness' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const completedModules = modules.filter(m => m.status === 'completed').length;
  const overallProgress = Math.round(modules.reduce((acc, m) => acc + m.progress, 0) / modules.length);

  return (
    <div className="dashboard-page">
      {/* Welcome Header */}
      <div className="dashboard-welcome">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p>Continue your cybersecurity training and stay protected.</p>
        </div>
        <div className="dashboard-points-badge">
          <FiAward />
          <div>
            <span className="points-num">{user?.points || 340}</span>
            <span className="points-label">Points</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="dashboard-notifications">
          {notifications.map((n, i) => (
            <div key={i} className={`notif notif-${n.type}`}>
              {n.type === 'warning' && <FiAlertTriangle />}
              {n.type === 'success' && <FiCheckCircle />}
              {n.type === 'info' && <FiShield />}
              <span>{n.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats Row */}
      <div className="dashboard-stats">
        <div className="card stat-card">
          <div className="stat-icon blue"><FiBook /></div>
          <div>
            <div className="stat-num">{completedModules}/{modules.length}</div>
            <div className="stat-label">Modules Complete</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon green"><FiTrendingUp /></div>
          <div>
            <div className="stat-num">{overallProgress}%</div>
            <div className="stat-label">Overall Progress</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon purple"><FiAward /></div>
          <div>
            <div className="stat-num">{user?.badges || 3}</div>
            <div className="stat-label">Badges Earned</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon orange"><FiShield /></div>
          <div>
            <div className="stat-num">92%</div>
            <div className="stat-label">Threat Awareness</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Training Modules */}
        <div className="card module-progress-card">
          <div className="card-title-row">
            <h3>Training Modules</h3>
            <Link to="/modules" className="view-all-link">View all <FiArrowRight /></Link>
          </div>
          <div className="module-list">
            {modules.map(m => (
              <Link to={`/modules/${m.id}`} key={m.id} className="module-row">
                <span className="module-emoji">{m.icon}</span>
                <div className="module-info">
                  <div className="module-title-row">
                    <span className="module-name">{m.title}</span>
                    <span className={`badge badge-${m.status === 'completed' ? 'success' : m.status === 'in_progress' ? 'warning' : 'info'}`}>
                      {m.status === 'completed' ? 'Done' : m.status === 'in_progress' ? 'In Progress' : 'Start'}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${m.progress}%` }} />
                  </div>
                  <span className="module-pct">{m.progress}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="dashboard-right-col">
          {/* Quick Actions */}
          <div className="card quick-actions-card">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <Link to="/simulation" className="quick-action-btn">
                <span>📧</span> Phishing Sim
              </Link>
              <Link to="/threat-analysis" className="quick-action-btn">
                <span>🔍</span> Analyze Threat
              </Link>
              <Link to="/knowledge-hub" className="quick-action-btn">
                <span>📚</span> Knowledge Hub
              </Link>
              <Link to="/progress" className="quick-action-btn">
                <span>🏆</span> My Progress
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card activity-card">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {recentActivity.map((a, i) => (
                <div key={i} className="activity-item">
                  <span className="activity-icon">{a.icon}</span>
                  <div className="activity-info">
                    <span className="activity-text">{a.text}</span>
                    <span className="activity-time"><FiClock size={11} /> {a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
