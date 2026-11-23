import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setOk(''); setLoading(true);
    try {
      const { data } = await authApi.register(fullName, email, password);
      setOk(data.message + ' (Check MailHog at http://localhost:8025 for the verification link.)');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
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
          <h1>Start trading<br />in minutes.</h1>
          <p>
            Create a free account and get virtual capital to practice with. Explore real
            markets, place orders, and learn the ropes — completely risk-free.
          </p>
        </div>

        <div className="auth2-features">
          <div className="auth2-feature">
            <div className="ic">🎁</div>
            <div>
              <h4>Virtual starting capital</h4>
              <p>Begin with simulated funds across Indian and US markets.</p>
            </div>
          </div>
          <div className="auth2-feature">
            <div className="ic g">🔒</div>
            <div>
              <h4>Secure &amp; private</h4>
              <p>Email verification and optional two-factor authentication.</p>
            </div>
          </div>
          <div className="auth2-feature">
            <div className="ic y">📚</div>
            <div>
              <h4>Learn by doing</h4>
              <p>Track performance and sharpen your strategy over time.</p>
            </div>
          </div>
        </div>

        <div className="auth2-ticker">
          <span className="t">No real money · No risk · Cancel anytime</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth2-form-panel">
        <div className="auth2-form">
          <div className="head">
            <h2>Create your account</h2>
            <p>Join StockSim Pro and start practicing today</p>
          </div>

          {error && <div className="auth2-error">{error}</div>}
          {ok && <div className="auth2-ok">{ok}</div>}

          <form onSubmit={submit}>
            <div className="auth2-field">
              <label htmlFor="reg-name">Full name</label>
              <div className="auth2-input">
                <span className="lead">👤</span>
                <input id="reg-name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name" required />
              </div>
            </div>

            <div className="auth2-field">
              <label htmlFor="reg-email">Email</label>
              <div className="auth2-input">
                <span className="lead">✉</span>
                <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required />
              </div>
            </div>

            <div className="auth2-field">
              <label htmlFor="reg-password">Password <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(min 6 chars)</span></label>
              <div className="auth2-input">
                <span className="lead">🔒</span>
                <input id="reg-password" type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                <button type="button" className="toggle" onClick={() => setShowPw((s) => !s)}>
                  {showPw ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button type="submit" className="auth2-btn" disabled={loading}>
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>

          <div className="auth2-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
