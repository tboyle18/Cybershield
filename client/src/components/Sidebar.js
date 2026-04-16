import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiHome, FiBook, FiMail, FiBarChart2, FiUsers,
  FiLogOut, FiShield, FiSun, FiMoon,
  FiAward, FiSettings, FiHelpCircle, FiGrid
} from 'react-icons/fi';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
  { to: '/modules', icon: <FiBook />, label: 'Training Modules' },
  { to: '/simulation', icon: <FiMail />, label: 'Phishing Sim' },
  { to: '/threat-analysis', icon: <FiShield />, label: 'Threat Analysis' },
  { to: '/knowledge-hub', icon: <FiGrid />, label: 'Knowledge Hub' },
  { to: '/progress', icon: <FiBarChart2 />, label: 'My Progress' },
  { to: '/leaderboard', icon: <FiAward />, label: 'Leaderboard' },
];

const adminItems = [
  { to: '/admin', icon: <FiUsers />, label: 'Admin Dashboard' },
  { to: '/admin/compliance', icon: <FiBarChart2 />, label: 'Compliance' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <FiShield className="logo-icon" />
          {!collapsed && <span>CyberShield</span>}
        </div>
        <button className="collapse-btn" onClick={() => setCollapsed(c => !c)}>
          {collapsed ? '»' : '«'}
        </button>
      </div>

      {!collapsed && user && (
        <div className="sidebar-user">
          <div className="user-avatar">{user.name?.[0]?.toUpperCase() || 'U'}</div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role || 'Employee'}</span>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            {!collapsed && <div className="nav-section-label">Admin</div>}
            {adminItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><FiSettings /></span>
          {!collapsed && <span className="nav-label">Profile</span>}
        </NavLink>
        <NavLink to="/help" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><FiHelpCircle /></span>
          {!collapsed && <span className="nav-label">Help & Support</span>}
        </NavLink>
        <button className="nav-item theme-toggle" onClick={toggleTheme}>
          <span className="nav-icon">{theme === 'dark' ? <FiSun /> : <FiMoon />}</span>
          {!collapsed && <span className="nav-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <span className="nav-icon"><FiLogOut /></span>
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
