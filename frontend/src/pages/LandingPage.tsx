import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { stockApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { Stock } from '../types';

const features = [
  { ic: '📈', title: 'Real-time markets', text: 'Follow live prices and interactive charts across Indian and US stocks.' },
  { ic: '💡', title: 'AI-powered signals', text: 'Technical indicators turn into clear buy, hold and sell guidance.' },
  { ic: '💱', title: 'Dual-currency wallet', text: 'Hold and trade in ₹ and $ with separate balances — no conversion guesswork.' },
  { ic: '🧾', title: 'Full order types', text: 'Place Market, Limit and Stop-Loss orders with an automated matching engine.' },
  { ic: '🏆', title: 'Paper trading', text: 'Practice risk-free with virtual capital and compete on the leaderboard.' },
  { ic: '🔔', title: 'Alerts & insights', text: 'Set price alerts, build watchlists, and track your portfolio performance.' },
];

const steps = [
  { n: '1', title: 'Create your account', text: 'Sign up in seconds and verify your email to get started.' },
  { n: '2', title: 'Explore the markets', text: 'Browse Indian and US stocks, study charts, and read AI signals.' },
  { n: '3', title: 'Trade & track', text: 'Place orders, manage your portfolio, and watch your returns grow.' },
];

const stats = [
  { v: '34+', k: 'Stocks across 2 markets' },
  { v: '₹10L', k: 'Paper-trading capital' },
  { v: '2', k: 'Currencies supported' },
  { v: '100%', k: 'Risk-free & simulated' },
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

      <section className="landing-section">
        <div className="landing-section-head">
          <h2>Everything you need to learn the markets</h2>
          <p>A complete trading experience — minus the financial risk.</p>
        </div>
        <div className="landing-features">
          {features.map((f) => (
            <div className="landing-feature" key={f.title}>
              <div className="fic">{f.ic}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-stats">
        {stats.map((s) => (
          <div className="landing-stat" key={s.k}>
            <div className="sv">{s.v}</div>
            <div className="sk">{s.k}</div>
          </div>
        ))}
      </section>

      <section className="landing-section">
        <div className="landing-section-head">
          <h2>Get started in three steps</h2>
          <p>From sign-up to your first trade in minutes.</p>
        </div>
        <div className="landing-steps">
          {steps.map((s) => (
            <div className="landing-step" key={s.n}>
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-closing">
        <h2>Ready to start trading?</h2>
        <p>Join StockSim Pro and build your market confidence today — completely free.</p>
        {!user && <Link to="/register" className="btn-lg btn-grad">Create your free account</Link>}
        {user && <Link to="/dashboard" className="btn-lg btn-grad">Go to Dashboard →</Link>}
      </section>

      <footer className="landing-foot">
        StockSim Pro — a simulated trading platform for learning. All money and trades are virtual.
      </footer>
    </div>
  );
}
