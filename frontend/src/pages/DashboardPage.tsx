import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { portfolioApi, stockApi } from '../services/api';
import type { PortfolioSummary, SnapshotPoint, Stock } from '../types';
import { inr, pct, cls } from '../services/format';

export default function DashboardPage() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [history, setHistory] = useState<SnapshotPoint[]>([]);
  const [movers, setMovers] = useState<Stock[]>([]);

  useEffect(() => {
    portfolioApi.summary().then((r) => setSummary(r.data)).catch(() => {});
    portfolioApi.history(30).then((r) => setHistory(r.data)).catch(() => {});
    stockApi.list('', 0, 50).then((r) => {
      const sorted = [...r.data.content].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
      setMovers(sorted.slice(0, 6));
    }).catch(() => {});
  }, []);

  const chartData = history.map((h) => ({
    t: new Date(h.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    v: h.value,
  }));

  // Dashboard cards are INR-focused (the value chart is INR-only by design).
  const inrSec = summary?.sections.find((s) => s.currency === 'INR');
  const netWorth = inrSec ? inrSec.walletBalance + inrSec.totalCurrentValue : undefined;

  return (
    <div>
      <h1 className="page-title">Dashboard <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: 14 }}>· India (₹)</span></h1>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="stat-label">Net Worth</div>
          <div className="stat-value">{inr(netWorth)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Portfolio Value</div>
          <div className="stat-value">{inr(inrSec?.totalCurrentValue)}</div>
          <div className={`stat-sub ${cls(inrSec?.totalUnrealizedPnl)}`}>
            {inr(inrSec?.totalUnrealizedPnl)} ({pct(inrSec?.totalUnrealizedPnlPercent)})
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Wallet Balance</div>
          <div className="stat-value">{inr(inrSec?.walletBalance)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Realized P&L</div>
          <div className={`stat-value ${cls(inrSec?.totalRealizedPnl)}`}>{inr(inrSec?.totalRealizedPnl)}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="stat-label" style={{ marginBottom: 12 }}>Portfolio Value (recent)</div>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <XAxis dataKey="t" stroke="#8b93a7" fontSize={11} />
                <YAxis stroke="#8b93a7" fontSize={11} domain={['auto', 'auto']} width={70}
                  tickFormatter={(v) => '₹' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid #272e3f', borderRadius: 8 }}
                  formatter={(v: number) => inr(v)} />
                <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
              Collecting snapshots… the chart fills in as the snapshot job runs (every ~60s).
            </p>
          )}
        </div>

        <div className="card">
          <div className="stat-label" style={{ marginBottom: 12 }}>Top Movers Today</div>
          <table>
            <tbody>
              {movers.map((s) => (
                <tr key={s.id}>
                  <td><Link to={`/stock/${s.id}`} style={{ fontWeight: 600 }}>{s.symbol}</Link></td>
                  <td>{inr(s.currentPrice)}</td>
                  <td className={cls(s.changePercent)} style={{ textAlign: 'right' }}>{pct(s.changePercent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
