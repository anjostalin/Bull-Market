import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { portfolioApi, stockApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { PortfolioSummary, SnapshotPoint, Stock } from '../types';
import { money, pct, cls } from '../services/format';

function ValueChart({ title, data, cur }: { title: string; data: SnapshotPoint[]; cur: 'INR' | 'USD' }) {
  const chartData = data.map((h) => ({
    t: new Date(h.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    v: h.value,
  }));
  const sym = cur === 'USD' ? '$' : '₹';
  return (
    <div className="card">
      <div className="section-head"><h3>{title}</h3>
        <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>recent</span></div>
      {chartData.length > 1 ? (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`pv-${cur}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" stroke="#8b93a7" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#8b93a7" fontSize={11} domain={['auto', 'auto']} width={70} tickLine={false} axisLine={false}
              tickFormatter={(v) => sym + (v / 1000).toFixed(0) + 'k'} />
            <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid #272e3f', borderRadius: 8 }}
              formatter={(v: number) => money(v, cur)} />
            <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} fill={`url(#pv-${cur})`} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="empty-state">
          <div className="ico">📊</div>
          <h4>Building your chart</h4>
          <p>Your portfolio value is sampled periodically — this fills in as snapshots are captured.</p>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [histInr, setHistInr] = useState<SnapshotPoint[]>([]);
  const [histUsd, setHistUsd] = useState<SnapshotPoint[]>([]);
  const [movers, setMovers] = useState<Stock[]>([]);

  useEffect(() => {
    const load = () => {
      portfolioApi.summary().then((r) => setSummary(r.data)).catch(() => {});
      stockApi.list('', 0, 50).then((r) => {
        const sorted = [...r.data.content].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
        setMovers(sorted.slice(0, 6));
      }).catch(() => {});
    };
    load();
    portfolioApi.history(30, 'INR').then((r) => setHistInr(r.data)).catch(() => {});
    portfolioApi.history(30, 'USD').then((r) => setHistUsd(r.data)).catch(() => {});
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  const inrSec = summary?.sections.find((s) => s.currency === 'INR');
  const usdSec = summary?.sections.find((s) => s.currency === 'USD');
  const firstName = user?.fullName?.split(/\s+/)[0] ?? 'Trader';

  // One stat row per currency (India ₹ and US $) so both portfolios are visible.
  const row = (sec: typeof inrSec, cur: 'INR' | 'USD', flag: string, label: string) => {
    const netWorth = sec ? sec.walletBalance + sec.totalCurrentValue : undefined;
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)', margin: '4px 2px 10px' }}>{flag} {label}</div>
        <div className="grid grid-4">
          <div className="card">
            <div className="stat-card-head"><div className="stat-label" style={{ margin: 0 }}>Net Worth</div><div className="stat-ic">💰</div></div>
            <div className="stat-value">{money(netWorth, cur)}</div>
          </div>
          <div className="card">
            <div className="stat-card-head"><div className="stat-label" style={{ margin: 0 }}>Holdings Value</div><div className="stat-ic g">📈</div></div>
            <div className="stat-value">{money(sec?.totalCurrentValue, cur)}</div>
            <div className={`stat-sub ${cls(sec?.totalUnrealizedPnl)}`}>
              {money(sec?.totalUnrealizedPnl, cur)} ({pct(sec?.totalUnrealizedPnlPercent)})
            </div>
          </div>
          <div className="card">
            <div className="stat-card-head"><div className="stat-label" style={{ margin: 0 }}>Wallet Balance</div><div className="stat-ic y">👛</div></div>
            <div className="stat-value">{money(sec?.walletBalance, cur)}</div>
          </div>
          <div className="card">
            <div className="stat-card-head"><div className="stat-label" style={{ margin: 0 }}>Realized P&L</div>
              <div className={`stat-ic ${(sec?.totalRealizedPnl ?? 0) < 0 ? 'r' : 'g'}`}>{(sec?.totalRealizedPnl ?? 0) < 0 ? '📉' : '✅'}</div></div>
            <div className={`stat-value ${cls(sec?.totalRealizedPnl)}`}>{money(sec?.totalRealizedPnl, cur)}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="page-title">
        Welcome back, {firstName} 👋
      </h1>

      {row(inrSec, 'INR', '🇮🇳', 'India (₹)')}
      {row(usdSec, 'USD', '🇺🇸', 'US ($)')}

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <ValueChart title="🇮🇳 India Portfolio (₹)" data={histInr} cur="INR" />
        <ValueChart title="🇺🇸 US Portfolio ($)" data={histUsd} cur="USD" />
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="section-head"><h3>Top Movers Today</h3>
            <Link to="/market" style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>View market →</Link></div>
          <table>
            <tbody>
              {movers.map((s) => (
                <tr key={s.id}>
                  <td style={{ width: 28 }}>{s.market === 'US' ? '🇺🇸' : '🇮🇳'}</td>
                  <td><Link to={`/stock/${s.id}`} style={{ fontWeight: 600 }}>{s.symbol}</Link></td>
                  <td style={{ textAlign: 'right' }}>{money(s.currentPrice, s.currency)}</td>
                  <td className={`chg-pill ${cls(s.changePercent)}`} style={{ textAlign: 'right' }}>
                    {s.changePercent >= 0 ? '▲' : '▼'} {Math.abs(s.changePercent).toFixed(2)}%
                  </td>
                </tr>
              ))}
              {movers.length === 0 && (
                <tr><td colSpan={4}><div className="empty-state" style={{ padding: 24 }}><p>Loading market…</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
