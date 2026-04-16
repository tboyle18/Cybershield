import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiCheckCircle, FiClock, FiStar } from 'react-icons/fi';
import './Modules.css';

const modules = [
  {
    id: 1,
    title: 'Phishing Awareness',
    description: 'Learn to recognize phishing emails, fake websites, and social engineering attacks. Master the art of detecting suspicious communications before they cause harm.',
    icon: '🎣',
    sections: 6,
    duration: '45 min',
    difficulty: 'Beginner',
    progress: 100,
    status: 'completed',
    points: 200,
    badge: 'Phish Spotter',
    topics: ['Email red flags', 'Fake login pages', 'Urgent message tactics', 'Sender verification', 'Link inspection'],
  },
  {
    id: 2,
    title: 'Password Security',
    description: 'Understand strong password practices, password managers, multi-factor authentication, and how attackers crack weak credentials.',
    icon: '🔐',
    sections: 5,
    duration: '35 min',
    difficulty: 'Beginner',
    progress: 75,
    status: 'in_progress',
    points: 150,
    badge: 'Key Keeper',
    topics: ['Password strength', 'MFA setup', 'Password managers', 'Credential stuffing', 'Account recovery'],
  },
  {
    id: 3,
    title: 'Safe Browsing',
    description: 'Protect yourself while browsing the web. Learn about HTTPS, browser security settings, malicious ads, and safe download practices.',
    icon: '🌐',
    sections: 5,
    duration: '30 min',
    difficulty: 'Beginner',
    progress: 30,
    status: 'in_progress',
    points: 150,
    badge: 'Web Guardian',
    topics: ['HTTPS vs HTTP', 'Browser extensions', 'Malvertising', 'Safe downloads', 'VPN basics'],
  },
  {
    id: 4,
    title: 'Mobile Device Security',
    description: 'Secure your smartphones and tablets. Explore smishing (SMS phishing), app permissions, mobile malware, and best practices for on-the-go safety.',
    icon: '📱',
    sections: 4,
    duration: '25 min',
    difficulty: 'Intermediate',
    progress: 0,
    status: 'not_started',
    points: 150,
    badge: 'Mobile Defender',
    topics: ['Smishing attacks', 'App permissions', 'Public Wi-Fi risks', 'Device encryption'],
  },
  {
    id: 5,
    title: 'Data Privacy',
    description: 'Learn how your personal data is collected, used, and protected. Understand privacy laws, data breaches, and how to minimize your digital footprint.',
    icon: '🛡️',
    sections: 5,
    duration: '40 min',
    difficulty: 'Intermediate',
    progress: 0,
    status: 'not_started',
    points: 200,
    badge: 'Privacy Pro',
    topics: ['PII protection', 'Data breach response', 'Privacy settings', 'GDPR basics', 'Minimizing exposure'],
  },
];

const difficultyColor = { Beginner: 'success', Intermediate: 'warning', Advanced: 'danger' };

export default function Modules() {
  const [filter, setFilter] = useState('all');

  const filtered = modules.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'in_progress') return m.status === 'in_progress';
    if (filter === 'completed') return m.status === 'completed';
    if (filter === 'not_started') return m.status === 'not_started';
    return true;
  });

  return (
    <div className="modules-page">
      <div className="modules-header">
        <div>
          <h1>Training Modules</h1>
          <p>Complete all 5 modules to earn your CyberShield certification</p>
        </div>
        <div className="modules-filter">
          {['all', 'in_progress', 'completed', 'not_started'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f === 'completed' ? 'Completed' : 'Not Started'}
            </button>
          ))}
        </div>
      </div>

      <div className="modules-grid">
        {filtered.map(m => (
          <div key={m.id} className={`card module-card ${m.status}`}>
            <div className="module-card-top">
              <span className="module-card-emoji">{m.icon}</span>
              <div className="module-card-badges">
                <span className={`badge badge-${difficultyColor[m.difficulty]}`}>{m.difficulty}</span>
                {m.status === 'completed' && <span className="badge badge-success"><FiCheckCircle size={11} /> Done</span>}
              </div>
            </div>

            <h3 className="module-card-title">{m.title}</h3>
            <p className="module-card-desc">{m.description}</p>

            <div className="module-card-meta">
              <span><FiClock size={13} /> {m.duration}</span>
              <span>📄 {m.sections} sections</span>
              <span><FiStar size={13} /> {m.points} pts</span>
            </div>

            <div className="module-topics">
              {m.topics.slice(0, 3).map((t, i) => (
                <span key={i} className="topic-chip">{t}</span>
              ))}
              {m.topics.length > 3 && <span className="topic-chip muted">+{m.topics.length - 3} more</span>}
            </div>

            {m.status !== 'not_started' && (
              <div className="module-card-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${m.progress}%` }} />
                </div>
                <span>{m.progress}%</span>
              </div>
            )}

            <div className="module-card-badge-earn">
              Earn badge: <strong>{m.badge}</strong>
            </div>

            <Link
              to={`/modules/${m.id}`}
              className={`btn ${m.status === 'completed' ? 'btn-outline' : 'btn-primary'} module-card-btn`}
            >
              {m.status === 'completed' ? (
                <><FiCheckCircle /> Review Module</>
              ) : m.status === 'in_progress' ? (
                <><FiPlay /> Continue</>
              ) : (
                <><FiPlay /> Start Module</>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
