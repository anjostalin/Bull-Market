import { useEffect, useState } from 'react';
import { paperApi } from '../services/api';
import { inr, pct, cls } from '../services/format';

interface LeaderboardEntry {
  rank: number; trader: string; totalValue: number; returnPercent: number;
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

  return (
    <div>
      <h1 className="page-title">Paper Trading Leaderboard</h1>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>Rank</th><th>Trader</th><th style={{ textAlign: 'right' }}>Total Value</th>
              <th style={{ textAlign: 'right' }}>Return %</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rank}>
                <td style={{ fontWeight: 700 }}>{medal(r.rank)}</td>
                <td>{r.trader}</td>
                <td style={{ textAlign: 'right' }}>{inr(r.totalValue)}</td>
                <td className={cls(r.returnPercent)} style={{ textAlign: 'right', fontWeight: 600 }}>{pct(r.returnPercent)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} style={{ color: 'var(--text-dim)' }}>No paper traders yet. Start trading in the sandbox!</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
