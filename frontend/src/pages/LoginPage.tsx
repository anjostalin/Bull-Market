import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('trader@stocksim.local');
  const [password, setPassword] = useState('Password123');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>Stock<span>Sim</span> Pro</h1>
        <p className="sub">Sign in to your trading account</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="field">
            <label>2FA code (if enabled)</label>
            <input value={totpCode} onChange={(e) => setTotpCode(e.target.value)} placeholder="optional" />
          </div>
          <button className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div className="auth-switch">
          No account? <Link to="/register">Create one</Link>
        </div>
        <div className="auth-switch" style={{ marginTop: 8, fontSize: 12 }}>
          Demo: trader@stocksim.local / Password123
        </div>
      </div>
    </div>
  );
}
