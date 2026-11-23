import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api';

type State = 'verifying' | 'success' | 'error';

export default function VerifyPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState<State>('verifying');
  const [message, setMessage] = useState('Verifying your account…');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard against StrictMode double-invoke (token is single-use)
    ran.current = true;
    if (!token) {
      setState('error');
      setMessage('Missing verification token. Please use the link from your email.');
      return;
    }
    authApi.verify(token)
      .then(() => { setState('success'); setMessage('Your email is confirmed. You can now sign in and start trading.'); })
      .catch((err) => {
        setState('error');
        setMessage(err.response?.data?.error || 'Verification failed. The link may have expired or already been used.');
      });
  }, [token]);

  const icon = state === 'success' ? '✓' : state === 'error' ? '✕' : '…';
  const iconColor = state === 'success' ? 'var(--green)' : state === 'error' ? 'var(--red)' : 'var(--accent)';

  return (
    <div className="auth2">
      <div className="auth2-brand">
        <div className="auth2-logo">Stock<span>Sim</span> Pro<span className="dot">.</span></div>
        <div className="auth2-hero">
          <h1>Almost there.</h1>
          <p>We're confirming your email so you can start trading in a safe, simulated environment.</p>
        </div>
        <div className="auth2-ticker"><span className="t">Secure email verification · One-time link</span></div>
      </div>

      <div className="auth2-form-panel">
        <div className="auth2-form" style={{ textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
            display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 800, color: '#fff',
            background: iconColor,
          }}>{icon}</div>
          <div className="head" style={{ textAlign: 'center' }}>
            <h2>
              {state === 'verifying' ? 'Verifying…' : state === 'success' ? 'Email verified' : 'Verification failed'}
            </h2>
            <p>{message}</p>
          </div>
          {state === 'success' && (
            <Link to="/login" className="auth2-btn" style={{ display: 'block', textAlign: 'center' }}>
              Continue to sign in
            </Link>
          )}
          {state === 'error' && (
            <Link to="/register" className="auth2-btn" style={{ display: 'block', textAlign: 'center' }}>
              Back to register
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
