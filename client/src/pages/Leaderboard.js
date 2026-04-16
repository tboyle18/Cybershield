import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiAward } from 'react-icons/fi';
import './Leaderboard.css';

const leaderboard = [
  { rank: 1, name: 'Sarah Chen', points: 1980, badges: 8, modules: 5, dept: 'Engineering' },
  { rank: 2, name: 'Marcus Williams', points: 1740, badges: 7, modules: 5, dept: 'Sales' },
  { rank: 3, name: 'Priya Patel', points: 1620, badges: 6, modules: 4, dept: 'HR' },
  { rank: 4, name: 'Alex Johnson', points: 340, badges: 3, modules: 2, dept: 'IT' },
  { rank: 5, name: 'Jordan Kim', points: 300, badges: 2, modules: 2, dept: 'Finance' },
  { rank: 6, name: 'Chris Martinez', points: 200, badges: 2, modules: 1, dept: 'Legal' },
  { rank: 7, name: 'Taylor Brooks', points: 150, badges: 1, modules: 1, dept: 'Marketing' },
  { rank: 8, name: 'Sam Rivera', points: 100, badges: 1, modules: 1, dept: 'Operations' },
];

const medal = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function Leaderboard() {
  const { user } = useAuth();
  const myRank = leaderboard.find(l => l.name === user?.name) || leaderboard[3];

  return (
    <div className="leaderboard-page">
      <div className="lb-header">
        <h1>Leaderboard</h1>
        <p>See how you rank against your colleagues in cybersecurity training</p>
      </div>

      {/* Top 3 Podium */}
      <div className="podium">
        {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => (
          <div key={entry.rank} className={`podium-item rank-${entry.rank}`}>
            <div className="podium-avatar">{entry.name.split(' ').map(n => n[0]).join('')}</div>
            <div className="podium-medal">{medal[entry.rank]}</div>
            <div className="podium-name">{entry.name}</div>
            <div className="podium-points">{entry.points} pts</div>
            <div className={`podium-block block-${entry.rank}`} />
          </div>
        ))}
      </div>

      {/* Full Table */}
      <div className="card lb-table-card">
        <table className="lb-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Department</th>
              <th>Modules</th>
              <th>Badges</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map(entry => (
              <tr key={entry.rank} className={entry.name === (user?.name || 'Alex Johnson') ? 'my-row' : ''}>
                <td className="rank-cell">
                  {medal[entry.rank] || <span className="rank-num">#{entry.rank}</span>}
                </td>
                <td className="name-cell">
                  <div className="lb-avatar">{entry.name.split(' ').map(n => n[0]).join('')}</div>
                  <span>{entry.name}</span>
                  {entry.name === (user?.name || 'Alex Johnson') && <span className="you-badge">You</span>}
                </td>
                <td><span className="dept-chip">{entry.dept}</span></td>
                <td>{entry.modules}/5</td>
                <td><FiAward /> {entry.badges}</td>
                <td className="points-cell">{entry.points.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
