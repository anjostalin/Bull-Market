import { useEffect, useState } from 'react';
import { paperApi } from '../services/api';
import { inr, pct, cls } from '../services/format';

interface LeaderboardEntry {
  rank: number; trader: string; totalValue: number; returnPercent: number; profitLoss: number;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const load = () => paperApi.leaderboard().then((r) => setRows(r.data as LeaderboardEntry[])).catch(() => {});
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, []);

  const medal = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
  const top3 = rows.slice(0, 3);
  // Display order for the podium: 2nd, 1st, 3rd (classic podium layout).
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const classOf = (rank: number) => rank === 1 ? 'first' : rank === 2 ? 'second' : 'third';

  return (
    <div>
      <h1 className="page-title">Paper Trading Leaderboard <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: 14 }}>· ₹10,00,000 sandbox</span></h1>

      {podiumOrder.length > 0 && (
        <div className="podium">
          {podiumOrder.map((e) => (
            <div key={e.rank} className={`podium-card ${classOf(e.rank)}`}>
              <div className="podium-medal">{medal(e.rank)}</div>
              <div className="podium-name">{e.trader}</div>
              <div className={`podium-return ${cls(e.profitLoss)}`}>{e.profitLoss >= 0 ? '+' : ''}{inr(e.profitLoss)}</div>
              <div className="podium-value">{pct(e.returnPercent)} · {inr(e.totalValue)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>Rank</th><th>Trader</th>
              <th style={{ textAlign: 'right' }}>Profit / Loss</th>
              <th style={{ textAlign: 'right' }}>Return %</th>
              <th style={{ textAlign: 'right' }}>Total Value</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rank}>
                <td style={{ fontWeight: 700 }}>{medal(r.rank)}</td>
                <td>{r.trader}</td>
                <td className={cls(r.profitLoss)} style={{ textAlign: 'right', fontWeight: 700 }}>
                  {r.profitLoss >= 0 ? '+' : ''}{inr(r.profitLoss)}
                </td>
                <td className={`${cls(r.returnPercent)}`} style={{ textAlign: 'right', fontWeight: 600 }}>{pct(r.returnPercent)}</td>
                <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>{inr(r.totalValue)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5}>
                <div className="empty-state">
                  <div className="ico">🏆</div>
                  <h4>No paper traders yet</h4>
                  <p>Head to Paper Trading, make a few trades, and claim the top spot.</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
