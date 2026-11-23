import { useEffect, useState } from 'react';
import { paperApi, stockApi } from '../services/api';
import type { Stock } from '../types';
import { inr, pct, cls } from '../services/format';

interface PaperHoldingView {
  stockId: number; symbol: string; quantity: number;
  avgBuyPrice: number; currentPrice: number; currentValue: number; unrealizedPnl: number;
}
interface PaperPortfolio {
  balance: number; holdingsValue: number; totalValue: number;
  returnPercent: number; holdings: PaperHoldingView[];
}

export default function PaperTradingPage() {
  const [pf, setPf] = useState<PaperPortfolio | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockId, setStockId] = useState<number | ''>('');
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');

  const load = () => paperApi.portfolio().then((r) => setPf(r.data as PaperPortfolio)).catch(() => {});
  useEffect(() => {
    load();
    stockApi.list('', 0, 50).then((r) => { setStocks(r.data.content); if (r.data.content[0]) setStockId(r.data.content[0].id); });
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  const trade = async (direction: 'BUY' | 'SELL') => {
    setMsg('');
    if (!stockId) return;
    try {
      const { data } = await paperApi.trade(Number(stockId), direction, qty);
      setPf(data as PaperPortfolio);
      setMsg(`${direction} ${qty} executed`);
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Trade failed');
    }
  };

  return (
    <div>
      <h1 className="page-title">Paper Trading <span className="badge badge-blue" style={{ fontSize: 13 }}>SANDBOX ₹10,00,000</span></h1>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <div className="card"><div className="stat-card-head"><div className="stat-label" style={{ margin: 0 }}>Paper Balance</div><div className="stat-ic y">👛</div></div><div className="stat-value">{inr(pf?.balance)}</div></div>
        <div className="card"><div className="stat-card-head"><div className="stat-label" style={{ margin: 0 }}>Holdings Value</div><div className="stat-ic">💼</div></div><div className="stat-value">{inr(pf?.holdingsValue)}</div></div>
        <div className="card"><div className="stat-card-head"><div className="stat-label" style={{ margin: 0 }}>Total Value</div><div className="stat-ic">💰</div></div><div className="stat-value">{inr(pf?.totalValue)}</div></div>
        <div className="card"><div className="stat-card-head"><div className="stat-label" style={{ margin: 0 }}>Return</div>
          <div className={`stat-ic ${(pf?.returnPercent ?? 0) < 0 ? 'r' : 'g'}`}>{(pf?.returnPercent ?? 0) < 0 ? '📉' : '📈'}</div></div>
          <div className={`stat-value ${cls(pf?.returnPercent)}`}>{pct(pf?.returnPercent)}</div></div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-head"><h3>Place Paper Trade <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: 12 }}>(market order)</span></h3></div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={stockId} onChange={(e) => setStockId(Number(e.target.value))} style={{ maxWidth: 240 }}>
            {stocks.map((s) => <option key={s.id} value={s.id}>{s.symbol} — {inr(s.currentPrice)}</option>)}
          </select>
          <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} style={{ maxWidth: 120 }} />
          <button className="btn-green" onClick={() => trade('BUY')}>BUY</button>
          <button className="btn-red" onClick={() => trade('SELL')}>SELL</button>
          {msg && <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>{msg}</span>}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>Stock</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Avg</th>
              <th style={{ textAlign: 'right' }}>LTP</th><th style={{ textAlign: 'right' }}>Value</th><th style={{ textAlign: 'right' }}>P&L</th></tr>
          </thead>
          <tbody>
            {pf?.holdings.map((h) => (
              <tr key={h.stockId}>
                <td style={{ fontWeight: 700 }}>{h.symbol}</td>
                <td style={{ textAlign: 'right' }}>{h.quantity}</td>
                <td style={{ textAlign: 'right' }}>{inr(h.avgBuyPrice)}</td>
                <td style={{ textAlign: 'right' }}>{inr(h.currentPrice)}</td>
                <td style={{ textAlign: 'right' }}>{inr(h.currentValue)}</td>
                <td className={cls(h.unrealizedPnl)} style={{ textAlign: 'right' }}>{inr(h.unrealizedPnl)}</td>
              </tr>
            ))}
            {(!pf || pf.holdings.length === 0) && (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <div className="ico">🧪</div>
                  <h4>No paper holdings yet</h4>
                  <p>Use the panel above to place a risk-free trade with your ₹10,00,000 sandbox capital.</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
