import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { stockApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { Stock } from '../types';

const features = [
  { ic: '📈', title: 'Real-time markets', text: 'Live prices across Indian and US stocks, updated every second.' },
  { ic: '💡', title: 'AI-powered signals', text: 'Technical indicators turn into clear buy, hold and sell guidance.' },
  { ic: '💱', title: 'Dual-currency wallet', text: 'Trade in ₹ and $ with separate balances — no conversion guesswork.' },
  { ic: '🏆', title: 'Paper trading', text: 'Practice risk-free with virtual capital and climb the leaderboard.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [ticker, setTicker] = useState<Stock[]>([]);

  useEffect(() => {
    const load = () => stockApi.list('', 0, 8, 'symbol').then((r) => setTicker(r.data.content)).catch(() => {});
    load();
    const iv = setInterval(load, 2000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo">Stock<span>Sim</span> Pro<span className="dot">.</span></div>
        <div className="landing-nav-actions">
          <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user ? (
            <Link to="/dashboard" className="btn-primary" style={{ padding: '9px 18px' }}>Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost" style={{ padding: '9px 18px' }}>Sign in</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '9px 18px' }}>Get started</Link>
            </>
          )}
        </div>
      </nav>

      <header className="landing-hero">
        <span className="landing-badge">● Risk-free equity trading simulator</span>
        <h1>Learn to trade the markets — without risking a rupee.</h1>
        <p>
          Practice with real-time Indian and US stock prices, AI-driven insights, and a
          dual-currency portfolio. Build your instincts in a safe, simulated environment.
        </p>
        <div className="landing-cta">
          {user ? (
            <Link to="/dashboard" className="btn-lg btn-grad">Go to Dashboard →</Link>
          ) : (
            <>
              <Link to="/register" className="btn-lg btn-grad">Create free account</Link>
              <Link to="/login" className="btn-lg btn-ghost">Sign in</Link>
            </>
          )}
        </div>
      </header>

      <div className="landing-ticker">
        {ticker.length === 0 && <span className="t" style={{ opacity: 0.5 }}>Loading live market…</span>}
        {ticker.map((s) => (
          <span className="t" key={s.id}>
            <b>{s.symbol}</b>
            <span className={s.changePercent >= 0 ? 'pos' : 'neg'}>
              {s.changePercent >= 0 ? '▲' : '▼'} {Math.abs(s.changePercent).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>

      <section className="landing-features">
        {features.map((f) => (
          <div className="landing-feature" key={f.title}>
            <div className="fic">{f.ic}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      <footer className="landing-foot">
        StockSim Pro — a simulated trading platform for learning. All money and trades are virtual.
      </footer>
    </div>
  );
}
