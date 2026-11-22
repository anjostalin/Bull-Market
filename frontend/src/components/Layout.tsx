import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/market', label: 'Market' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/orders', label: 'Orders' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/paper', label: 'Paper Trading' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/wallet', label: 'Wallet' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Stock<span>Sim</span></div>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span>{l.label}</span>
          </NavLink>
        ))}
        {user?.role === 'ADMIN' && (
          <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span>Admin</span>
          </NavLink>
        )}
        <div className="spacer" />
        <button className="btn-ghost" onClick={handleLogout}>Logout</button>
      </aside>
      <div className="main">
        <header className="topbar">
          <div style={{ fontWeight: 600 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationBell />
            <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>{user?.fullName}</span>
            <span className="badge badge-blue">{user?.role}</span>
          </div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
