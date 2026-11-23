import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { portfolioApi, stockApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { PortfolioSummary, SnapshotPoint, Stock } from '../types';
import { inr, money, pct, cls } from '../services/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [history, setHistory] = useState<SnapshotPoint[]>([]);
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
    portfolioApi.history(30).then((r) => setHistory(r.data)).catch(() => {});
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  const chartData = history.map((h) => ({
    t: new Date(h.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    v: h.value,
  }));

  // Dashboard cards are INR-focused (the value chart is INR-only by design).
  const inrSec = summary?.sections.find((s) => s.currency === 'INR');
  const netWorth = inrSec ? inrSec.walletBalance + inrSec.totalCurrentValue : undefined;
  const firstName = user?.fullName?.split(/\s+/)[0] ?? 'Trader';

  return (
    <div>
      <h1 className="page-title">
        Welcome back, {firstName} 👋
        <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: 14 }}> · India (₹)</span>
      </h1>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="stat-card-head"><div className="stat-label" style={{ margin: 0 }}>Net Worth</div><div className="stat-ic">💰</div></div>
          <div className="stat-value">{inr(netWorth)}</div>
        </div>
        <div className="card">
          <div className="stat-card-head"><div className="stat-label" style={{ margin: 0 }}>Portfolio Value</div><div className="stat-ic g">📈</div></div>
          <div className="stat-value">{inr(inrSec?.totalCurrentValue)}</div>
          <div className={`stat-sub ${cls(inrSec?.totalUnrealizedPnl)}`}>
            {inr(inrSec?.totalUnrealizedPnl)} ({pct(inrSec?.totalUnrealizedPnlPercent)})
          </div>
        </div>
        <div className="card">
          <div className="stat-card-head"><div className="stat-label" style={{ margin: 0 }}>Wallet Balance</div><div className="stat-ic y">👛</div></div>
          <div className="stat-value">{inr(inrSec?.walletBalance)}</div>
        </div>
        <div className="card">
          <div className="stat-card-head"><div className="stat-label" style={{ margin: 0 }}>Realized P&L</div>
            <div className={`stat-ic ${(inrSec?.totalRealizedPnl ?? 0) < 0 ? 'r' : 'g'}`}>{(inrSec?.totalRealizedPnl ?? 0) < 0 ? '📉' : '✅'}</div></div>
          <div className={`stat-value ${cls(inrSec?.totalRealizedPnl)}`}>{inr(inrSec?.totalRealizedPnl)}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="section-head"><h3>Portfolio Value</h3>
            <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>₹ · recent</span></div>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" stroke="#8b93a7" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8b93a7" fontSize={11} domain={['auto', 'auto']} width={64} tickLine={false} axisLine={false}
                  tickFormatter={(v) => '₹' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid #272e3f', borderRadius: 8 }}
                  formatter={(v: number) => inr(v)} />
                <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} fill="url(#pv)" />
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
