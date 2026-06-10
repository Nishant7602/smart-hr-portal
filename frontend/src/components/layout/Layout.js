import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/jobs', icon: '💼', label: 'Jobs' },
  { to: '/applicants', icon: '👥', label: 'Applicants' },
  { to: '/interviews', icon: '📅', label: 'Interviews' },
  { to: '/ai-tools', icon: '🤖', label: 'AI Tools' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const initials = user?.fullName
    ?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏢</div>
          <div>
            <div className="sidebar-logo-text">SmartHR</div>
            <div className="sidebar-logo-sub">Recruitment Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}

          {isAdmin() && (
            <>
              <div className="nav-section-label" style={{ marginTop: 12 }}>Admin</div>
              <NavLink to="/jobs/new" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <span>➕</span><span>Post New Job</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.fullName}</div>
              <div className="user-role">{user?.roles?.[0]?.replace('_', ' ')}</div>
            </div>
            <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }} title="Logout">
              ↩
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
