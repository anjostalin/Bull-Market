import type { SignalView } from '../types';
import { money } from '../services/format';

const signalStyle: Record<string, { cls: string; label: string }> = {
  STRONG_BUY: { cls: 'badge-green', label: 'STRONG BUY' },
  BUY: { cls: 'badge-green', label: 'BUY' },
  HOLD: { cls: 'badge-yellow', label: 'HOLD' },
  SELL: { cls: 'badge-red', label: 'SELL' },
  STRONG_SELL: { cls: 'badge-red', label: 'STRONG SELL' },
};

export default function SignalCard({ signal, currency = 'INR' }: { signal: SignalView | null; currency?: string }) {
  if (!signal) return null;
  const s = signalStyle[signal.signal] ?? signalStyle.HOLD;
  const riskColor = signal.riskScore >= 7 ? 'var(--red)' : signal.riskScore >= 4 ? 'var(--yellow)' : 'var(--green)';

  return (
    <div className="card">
      <div className="stat-label" style={{ marginBottom: 12, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
        AI Signal
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <span className={`badge ${s.cls}`} style={{ fontSize: 15, padding: '6px 14px' }}>{s.label}</span>
        <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{signal.rationale}</span>
      </div>
      <div className="grid grid-4" style={{ gap: 10 }}>
        <div><span style={{ color: 'var(--text-dim)', fontSize: 13 }}>RSI-14</span><div style={{ fontWeight: 600 }}>{signal.rsi14.toFixed(1)}</div></div>
        <div><span style={{ color: 'var(--text-dim)', fontSize: 13 }}>Risk</span>
          <div style={{ fontWeight: 600, color: riskColor }}>{signal.riskScore}/10</div></div>
        <div><span style={{ color: 'var(--text-dim)', fontSize: 13 }}>SMA-7</span><div style={{ fontWeight: 600 }}>{money(signal.sma7, currency)}</div></div>
        <div><span style={{ color: 'var(--text-dim)', fontSize: 13 }}>SMA-14</span><div style={{ fontWeight: 600 }}>{money(signal.sma14, currency)}</div></div>
      </div>
    </div>
  );
}
