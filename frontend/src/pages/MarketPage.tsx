import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockApi } from '../services/api';
import type { Stock } from '../types';
import { money, pct, cls } from '../services/format';
import { useStockFeed } from '../hooks/useStockFeed';

type MarketTab = 'IN' | 'US';

export default function MarketPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [search, setSearch] = useState('');
  const [market, setMarket] = useState<MarketTab>('IN');
  const navigate = useNavigate();
  const live = useStockFeed();

  const load = (q: string, m: MarketTab) =>
    stockApi.list(q, 0, 50, 'symbol', m).then((r) => setStocks(r.data.content)).catch(() => {});

  // Reload on search/market change, then poll every 1s for a near-live feel.
  useEffect(() => {
    load(search, market);
    const iv = setInterval(() => load(search, market), 1000);
    return () => clearInterval(iv);
  }, [search, market]);

  // Merge live WebSocket prices over the fetched list (price + change only).
  const rows = stocks.map((s) => {
    const l = live[s.id];
    return l ? { ...s, currentPrice: l.price, changePercent: l.changePercent } : s;
  });

  const marketOpen = stocks.length > 0 ? stocks[0].marketOpen : true;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Market</h1>
        <div className="seg">
          <button className={`seg-btn ${market === 'IN' ? 'active' : ''}`} onClick={() => setMarket('IN')}>
            🇮🇳 India
          </button>
          <button className={`seg-btn ${market === 'US' ? 'active' : ''}`} onClick={() => setMarket('US')}>
            🇺🇸 US
          </button>
        </div>
      </div>

      {!marketOpen && (
        <div className="market-closed-banner">
          <span className="dot" /> {market === 'IN' ? 'Indian' : 'US'} market is closed — prices are frozen at the last traded value. Trading resumes at market open.
        </div>
      )}

      <div className="card" style={{ margin: '16px 0' }}>
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
                <td style={{ textAlign: 'right' }}>{money(s.currentPrice, s.currency)}</td>
                <td className={cls(s.changePercent)} style={{ textAlign: 'right' }}>{pct(s.changePercent)}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); navigate(`/stock/${s.id}`); }}>
                    Trade
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} style={{ color: 'var(--text-dim)' }}>No stocks found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
