import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { portfolioApi } from '../services/api';
import api from '../services/api';
import type { PortfolioSummary } from '../types';
import { inr, pct, cls } from '../services/format';

const COLORS = ['#3b82f6', '#16c784', '#f3ba2f', '#ea3943', '#a855f7', '#06b6d4', '#f97316', '#84cc16'];

async function download(path: string, filename: string) {
  const res = await api.get(path, { responseType: 'blob' });
  const url = window.URL.createObjectURL(res.data as Blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  window.URL.revokeObjectURL(url);
}

export default function PortfolioPage() {
  const [s, setS] = useState<PortfolioSummary | null>(null);

  useEffect(() => {
    const load = () => portfolioApi.summary().then((r) => setS(r.data)).catch(() => {});
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  if (!s) return <p>Loading…</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Portfolio</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={() => download('/reports/portfolio.pdf', 'portfolio-statement.pdf')}>Download PDF</button>
          <button className="btn-ghost" onClick={() => download('/reports/trades.csv', 'trade-history.csv')}>Export CSV</button>
        </div>
      </div>
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <div className="card"><div className="stat-label">Invested</div><div className="stat-value">{inr(s.totalInvested)}</div></div>
        <div className="card"><div className="stat-label">Current Value</div><div className="stat-value">{inr(s.totalCurrentValue)}</div></div>
        <div className="card"><div className="stat-label">Unrealized P&L</div>
          <div className={`stat-value ${cls(s.totalUnrealizedPnl)}`}>{inr(s.totalUnrealizedPnl)}</div>
          <div className={`stat-sub ${cls(s.totalUnrealizedPnlPercent)}`}>{pct(s.totalUnrealizedPnlPercent)}</div>
        </div>
        <div className="card"><div className="stat-label">Realized P&L</div>
          <div className={`stat-value ${cls(s.totalRealizedPnl)}`}>{inr(s.totalRealizedPnl)}</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div className="card">
          <div className="stat-label" style={{ marginBottom: 12 }}>Asset Allocation</div>
          {s.allocation.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={s.allocation} dataKey="value" nameKey="symbol" cx="50%" cy="50%" outerRadius={90}>
                  {s.allocation.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1c2333', border: '1px solid #272e3f', borderRadius: 8 }}
                  formatter={(v: number) => inr(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>No holdings yet.</p>}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Stock</th><th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Avg</th><th style={{ textAlign: 'right' }}>LTP</th>
                <th style={{ textAlign: 'right' }}>Value</th><th style={{ textAlign: 'right' }}>P&L</th>
              </tr>
            </thead>
            <tbody>
              {s.holdings.map((h) => (
                <tr key={h.stockId}>
                  <td style={{ fontWeight: 700 }}>{h.symbol}</td>
                  <td style={{ textAlign: 'right' }}>{h.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{inr(h.avgBuyPrice)}</td>
                  <td style={{ textAlign: 'right' }}>{inr(h.currentPrice)}</td>
                  <td style={{ textAlign: 'right' }}>{inr(h.currentValue)}</td>
                  <td className={cls(h.unrealizedPnl)} style={{ textAlign: 'right' }}>
                    {inr(h.unrealizedPnl)} ({pct(h.unrealizedPnlPercent)})
                  </td>
                </tr>
              ))}
              {s.holdings.length === 0 && (
                <tr><td colSpan={6} style={{ color: 'var(--text-dim)' }}>No holdings yet. Buy a stock from the Market.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
