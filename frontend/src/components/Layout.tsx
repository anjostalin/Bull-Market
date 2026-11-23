import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/market', label: 'Market', icon: '📈' },
  { to: '/portfolio', label: 'Portfolio', icon: '💼' },
  { to: '/orders', label: 'Orders', icon: '📋' },
  { to: '/watchlist', label: 'Watchlist', icon: '⭐' },
  { to: '/paper', label: 'Paper Trading', icon: '🧪' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { to: '/wallet', label: 'Wallet', icon: '👛' },
];

function initials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-text">Stock<span>Sim</span><span className="dot">.</span></span></div>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-ic">{l.icon}</span><span className="nav-label">{l.label}</span>
          </NavLink>
        ))}
        {user?.role === 'ADMIN' && (
          <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-ic">🛡️</span><span className="nav-label">Admin</span>
          </NavLink>
        )}
        <div className="spacer" />
        <button className="btn-ghost logout-btn" onClick={handleLogout}>
          <span className="nav-label">Logout</span><span className="nav-ic-only" style={{ display: 'none' }}>⏻</span>
        </button>
      </aside>
      <div className="main">
        <header className="topbar">
          <div />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="theme-toggle" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <NotificationBell />
            <div className="user-chip">
              <span style={{ fontSize: 14 }}>{user?.fullName}</span>
              <span className="badge badge-blue" style={{ fontSize: 11 }}>{user?.role}</span>
              <span className="avatar">{initials(user?.fullName)}</span>
            </div>
          </div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
