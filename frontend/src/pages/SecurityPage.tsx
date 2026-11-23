import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { totpApi } from '../services/api';

export default function SecurityPage() {
  const toast = useToast();
  const [otpauthUri, setOtpauthUri] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Extract the base32 secret from the otpauth:// URI for manual entry.
  const secret = otpauthUri ? new URLSearchParams(otpauthUri.split('?')[1]).get('secret') ?? '' : '';
  const qrUrl = otpauthUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUri)}`
    : '';

  const startSetup = async () => {
    setLoading(true);
    try {
      const { data } = await totpApi.setup();
      setOtpauthUri(data.otpauthUri);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Could not start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const confirmEnable = async () => {
    const n = Number(code);
    if (!n) { toast.error('Enter the 6-digit code from your authenticator app'); return; }
    setLoading(true);
    try {
      const { data } = await totpApi.enable(n);
      if (data.enabled) {
        setEnabled(true);
        setOtpauthUri(null);
        setCode('');
        toast.success('Two-factor authentication enabled');
      } else {
        toast.error('Invalid code — please try again');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Could not enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const disable2fa = async () => {
    setLoading(true);
    try {
      await totpApi.disable();
      setEnabled(false);
      toast.success('Two-factor authentication disabled');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Could not disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Security <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: 14 }}>· account protection</span></h1>

      <div className="card" style={{ maxWidth: 620 }}>
        <div className="section-head">
          <h3>🔐 Two-Factor Authentication (2FA)</h3>
          <span className={`badge ${enabled ? 'badge-green' : 'badge-gray'}`}>{enabled ? 'ENABLED' : 'DISABLED'}</span>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>
          Add an extra layer of security using an authenticator app (Google Authenticator, Authy, etc.).
          When enabled, you'll enter a 6-digit code at sign-in in addition to your password.
        </p>

        {!enabled && !otpauthUri && (
          <button className="btn-primary" onClick={startSetup} disabled={loading}>
            {loading ? 'Starting…' : 'Set up 2FA'}
          </button>
        )}

        {!enabled && otpauthUri && (
          <div>
            <ol style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.9, paddingLeft: 18, marginBottom: 16 }}>
              <li>Open your authenticator app and scan this QR code:</li>
            </ol>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
              <img src={qrUrl} alt="2FA QR code" width={180} height={180}
                style={{ borderRadius: 10, background: '#fff', padding: 8 }} />
              <div>
                <div style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 6 }}>Or enter this key manually:</div>
                <code style={{ background: 'var(--bg-elev-2)', padding: '8px 12px', borderRadius: 8, fontSize: 14, letterSpacing: 1, wordBreak: 'break-all' }}>{secret}</code>
              </div>
            </div>
            <div className="field" style={{ maxWidth: 240 }}>
              <label>Enter the 6-digit code to confirm</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" inputMode="numeric" maxLength={6} />
            </div>
            <button className="btn-primary" onClick={confirmEnable} disabled={loading}>
              {loading ? 'Verifying…' : 'Enable 2FA'}
            </button>
          </div>
        )}

        {enabled && (
          <button className="btn-red" onClick={disable2fa} disabled={loading}>
            {loading ? 'Disabling…' : 'Disable 2FA'}
          </button>
        )}
      </div>
    </div>
  );
}
