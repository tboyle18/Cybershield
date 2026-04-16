import React, { useState } from 'react';
import { FiSearch, FiBookOpen, FiVideo, FiFileText, FiExternalLink } from 'react-icons/fi';
import './KnowledgeHub.css';

const resources = [
  { id: 1, type: 'article', title: 'Top 10 Signs of a Phishing Email', category: 'Phishing', difficulty: 'Beginner', readTime: '5 min', description: 'A comprehensive guide to identifying the most common phishing indicators before they catch you off guard.' },
  { id: 2, type: 'video', title: 'How Attackers Craft Convincing Phishing Lures', category: 'Phishing', difficulty: 'Intermediate', readTime: '12 min', description: 'An in-depth video walkthrough of the psychology and techniques behind modern phishing campaigns.' },
  { id: 3, type: 'guide', title: 'Password Manager Setup Guide', category: 'Password Security', difficulty: 'Beginner', readTime: '8 min', description: 'Step-by-step instructions for setting up and using a password manager to secure all your accounts.' },
  { id: 4, type: 'article', title: 'Understanding Multi-Factor Authentication', category: 'Password Security', difficulty: 'Beginner', readTime: '6 min', description: 'Learn what MFA is, why it matters, and how to enable it on the most common platforms and services.' },
  { id: 5, type: 'article', title: 'Safe Browsing Best Practices', category: 'Safe Browsing', difficulty: 'Beginner', readTime: '7 min', description: 'Essential tips for staying safe online, from checking HTTPS to avoiding malicious downloads.' },
  { id: 6, type: 'video', title: 'Smishing: The Rise of Mobile Phishing', category: 'Mobile Security', difficulty: 'Intermediate', readTime: '9 min', description: 'How attackers use SMS to compromise mobile users and what you can do to protect yourself.' },
  { id: 7, type: 'guide', title: 'Data Breach Response Checklist', category: 'Data Privacy', difficulty: 'Intermediate', readTime: '10 min', description: 'A step-by-step checklist of actions to take immediately after discovering your data has been compromised.' },
  { id: 8, type: 'article', title: 'GDPR and Your Data Rights', category: 'Data Privacy', difficulty: 'Advanced', readTime: '15 min', description: 'An overview of your rights under GDPR and how to exercise them with companies that hold your data.' },
  { id: 9, type: 'video', title: 'Social Engineering: The Human Hack', category: 'Phishing', difficulty: 'Advanced', readTime: '20 min', description: 'A deep dive into social engineering tactics — from pretexting to quid pro quo — with real-world examples.' },
  { id: 10, type: 'guide', title: 'Securing Your Home Network', category: 'Safe Browsing', difficulty: 'Intermediate', readTime: '12 min', description: 'How to properly configure your router, set strong Wi-Fi passwords, and protect devices on your home network.' },
];

const categories = ['All', 'Phishing', 'Password Security', 'Safe Browsing', 'Mobile Security', 'Data Privacy'];
const types = ['All', 'article', 'video', 'guide'];
const typeIcon = { article: <FiBookOpen />, video: <FiVideo />, guide: <FiFileText /> };
const typeLabel = { article: 'Article', video: 'Video', guide: 'Reference Guide' };
const difficultyBadge = { Beginner: 'success', Intermediate: 'warning', Advanced: 'danger' };

export default function KnowledgeHub() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');

  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                        r.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || r.category === category;
    const matchType = type === 'All' || r.type === type;
    return matchSearch && matchCat && matchType;
  });

  return (
    <div className="hub-page">
      <div className="hub-header">
        <h1>Knowledge Hub</h1>
        <p>Browse articles, videos, and reference guides on cybersecurity topics</p>
      </div>

      <div className="hub-search-bar">
        <FiSearch className="hub-search-icon" />
        <input
          type="text"
          placeholder="Search by keyword, topic, or title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="hub-filters">
        <div className="filter-group">
          <label>Category</label>
          <div className="filter-chips">
            {categories.map(c => (
              <button key={c} className={`filter-chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>Type</label>
          <div className="filter-chips">
            {types.map(t => (
              <button key={t} className={`filter-chip ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>
                {t === 'All' ? 'All' : typeLabel[t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="hub-count">{filtered.length} resource{filtered.length !== 1 ? 's' : ''} found</div>

      <div className="hub-grid">
        {filtered.map(r => (
          <div key={r.id} className="card hub-card">
            <div className="hub-card-top">
              <span className={`hub-type-badge type-${r.type}`}>
                {typeIcon[r.type]} {typeLabel[r.type]}
              </span>
              <span className={`badge badge-${difficultyBadge[r.difficulty]}`}>{r.difficulty}</span>
            </div>
            <h3 className="hub-card-title">{r.title}</h3>
            <p className="hub-card-desc">{r.description}</p>
            <div className="hub-card-meta">
              <span className="hub-cat-chip">{r.category}</span>
              <span className="hub-read-time">⏱ {r.readTime}</span>
            </div>
            <button className="btn btn-outline hub-card-btn">
              {r.type === 'video' ? 'Watch' : 'Read'} <FiExternalLink size={13} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="hub-empty">
            <FiSearch size={36} />
            <p>No resources match your search. Try different keywords or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
