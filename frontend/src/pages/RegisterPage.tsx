import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Password requirement checks (must mirror the backend rules).
const pwChecks = (p: string) => [
  { label: 'At least 8 characters', ok: p.length >= 8 },
  { label: 'An uppercase letter (A–Z)', ok: /[A-Z]/.test(p) },
  { label: 'A lowercase letter (a–z)', ok: /[a-z]/.test(p) },
  { label: 'A number (0–9)', ok: /\d/.test(p) },
  { label: 'A special character (!@#$…)', ok: /[^A-Za-z0-9]/.test(p) },
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  const emailValid = EMAIL_RE.test(email);
  const checks = pwChecks(password);
  const pwValid = checks.every((c) => c.ok);
  const canSubmit = fullName.trim().length > 0 && emailValid && pwValid && !loading;

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
        <Link to="/" className="auth2-logo">Bull<span>Market</span><span className="dot">.</span></Link>

        <div className="auth2-hero">
          <h1>Start trading<br />in minutes.</h1>
          <p>
            Create a free account to trade real-time Indian and US markets — with live
            charts, instant orders, and a dual-currency portfolio.
          </p>
        </div>

        <div className="auth2-features">
          <div className="auth2-feature">
            <div className="ic">🎁</div>
            <div>
              <h4>Starting capital included</h4>
              <p>Begin with a funded ₹ and $ wallet across Indian and US markets.</p>
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
            <p>Join Bull Market and start practicing today</p>
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
                <input id="reg-email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} onBlur={() => setEmailTouched(true)}
                  placeholder="you@example.com" required />
              </div>
              {emailTouched && email.length > 0 && !emailValid && (
                <div className="field-hint err">Enter a valid email address (e.g. you@example.com)</div>
              )}
            </div>

            <div className="auth2-field">
              <label htmlFor="reg-password">Password</label>
              <div className="auth2-input">
                <span className="lead">🔒</span>
                <input id="reg-password" type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPwFocused(true)}
                  placeholder="••••••••" required />
                <button type="button" className="toggle" onClick={() => setShowPw((s) => !s)}>
                  {showPw ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              {(pwFocused || password.length > 0) && (
                <ul className="pw-checklist">
                  {checks.map((c) => (
                    <li key={c.label} className={c.ok ? 'met' : ''}>
                      <span className="pw-dot">{c.ok ? '✓' : '○'}</span>{c.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button type="submit" className="auth2-btn" disabled={!canSubmit}>
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
