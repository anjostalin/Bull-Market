import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { stockApi } from '../services/api';
import type { Stock } from '../types';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState<Stock[]>([]);

  // Live ticker from the public stocks endpoint (no auth required).
  useEffect(() => {
    const load = () =>
      stockApi.list('', 0, 8, 'symbol').then((r) => setTicker(r.data.content)).catch(() => {});
    load();
    const iv = setInterval(load, 1000);
    return () => clearInterval(iv);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, totpCode || undefined);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth2">
      {/* Left brand panel */}
      <div className="auth2-brand">
        <div className="auth2-logo">Stock<span>Sim</span> Pro<span className="dot">.</span></div>

        <div className="auth2-hero">
          <h1>Trade smarter.<br />Move faster.</h1>
          <p>
            Track real-time Indian and US markets, place orders instantly, and
            grow your portfolio — all from one powerful dashboard.
          </p>
        </div>

        <div className="auth2-features">
          <div className="auth2-feature">
            <div className="ic">📈</div>
            <div>
              <h4>Real-time markets</h4>
              <p>Follow live prices and charts across a curated list of stocks.</p>
            </div>
          </div>
          <div className="auth2-feature">
            <div className="ic g">💡</div>
            <div>
              <h4>Smart insights</h4>
              <p>Get clear buy, hold and sell signals to guide every decision.</p>
            </div>
          </div>
          <div className="auth2-feature">
            <div className="ic y">🏆</div>
            <div>
              <h4>Practice &amp; compete</h4>
              <p>Sharpen your strategy and climb the trading leaderboard.</p>
            </div>
          </div>
        </div>

        <div className="auth2-ticker">
          {ticker.length === 0 && <span className="t" style={{ opacity: 0.5 }}>Loading market…</span>}
          {ticker.map((s) => (
            <span className="t" key={s.id}>
              <b>{s.symbol}</b>
              <span className={s.changePercent >= 0 ? 'pos' : 'neg'}>
                {s.changePercent >= 0 ? '▲' : '▼'} {Math.abs(s.changePercent).toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth2-form-panel">
        <div className="auth2-form">
          <div className="head">
            <h2>Welcome back</h2>
            <p>Sign in to your trading account</p>
          </div>

          {error && <div className="auth2-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="auth2-field">
              <label htmlFor="login-email">Email</label>
              <div className="auth2-input">
                <span className="lead">✉</span>
                <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required />
              </div>
            </div>

            <div className="auth2-field">
              <label htmlFor="login-password">Password</label>
              <div className="auth2-input">
                <span className="lead">🔒</span>
                <input id="login-password" type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" className="toggle" onClick={() => setShowPw((s) => !s)}>
                  {showPw ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <div className="auth2-field">
              <label htmlFor="login-totp">2FA code <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(if enabled)</span></label>
              <div className="auth2-input">
                <span className="lead">#</span>
                <input id="login-totp" value={totpCode} onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="6-digit code" inputMode="numeric" />
              </div>
            </div>

            <button type="submit" className="auth2-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="auth2-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
