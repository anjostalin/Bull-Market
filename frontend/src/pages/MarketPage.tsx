import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockApi } from '../services/api';
import type { Stock } from '../types';
import { inr, pct, cls } from '../services/format';
import { useStockFeed } from '../hooks/useStockFeed';

export default function MarketPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const live = useStockFeed();

  const load = (q: string) => stockApi.list(q, 0, 50).then((r) => setStocks(r.data.content)).catch(() => {});

  useEffect(() => { load(search); }, [search]);

  // Merge live WebSocket prices over the fetched list
  const rows = stocks.map((s) => {
    const l = live[s.id];
    return l ? { ...s, currentPrice: l.price, changePercent: l.changePercent } : s;
  });

  return (
    <div>
      <h1 className="page-title">Market</h1>
      <div className="card" style={{ marginBottom: 16 }}>
        <input placeholder="Search by symbol or company…" value={search}
          onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Symbol</th><th>Company</th><th>Sector</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th style={{ textAlign: 'right' }}>Change</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/stock/${s.id}`)}>
                <td style={{ fontWeight: 700 }}>{s.symbol}</td>
                <td style={{ color: 'var(--text-dim)' }}>{s.companyName}</td>
                <td><span className="badge badge-gray">{s.sector}</span></td>
                <td style={{ textAlign: 'right' }}>{inr(s.currentPrice)}</td>
                <td className={cls(s.changePercent)} style={{ textAlign: 'right' }}>{pct(s.changePercent)}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); navigate(`/stock/${s.id}`); }}>
                    Trade
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
