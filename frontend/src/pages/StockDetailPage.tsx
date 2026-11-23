import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { alertApi, orderApi, signalApi, stockApi, watchlistApi } from '../services/api';
import type { Candle, SignalView, Stock, WatchlistView } from '../types';
import { money, pct, cls } from '../services/format';
import { useToast } from '../context/ToastContext';
import SignalCard from '../components/SignalCard';
import PriceChart from '../components/PriceChart';

export default function StockDetailPage() {
  const { id } = useParams();
  const stockId = Number(id);
  const toast = useToast();
  const [stock, setStock] = useState<Stock | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [signal, setSignal] = useState<SignalView | null>(null);
  const [watchlists, setWatchlists] = useState<WatchlistView[]>([]);

  // order form
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP_LOSS'>('MARKET');
  const [qty, setQty] = useState(1);
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');

  useEffect(() => {
    stockApi.get(stockId).then((r) => setStock(r.data)).catch(() => {});
    stockApi.history(stockId).then((r) => setCandles(r.data)).catch(() => {});
    signalApi.get(stockId).then((r) => setSignal(r.data)).catch(() => {});
    watchlistApi.list().then((r) => setWatchlists(r.data)).catch(() => {});
    const iv = setInterval(() => {
      stockApi.get(stockId).then((r) => setStock(r.data)).catch(() => {});
      signalApi.get(stockId).then((r) => setSignal(r.data)).catch(() => {});
    }, 1000);
    return () => clearInterval(iv);
  }, [stockId]);

  const placeOrder = async () => {
    try {
      const { data } = await orderApi.place({
        stockId, orderType, direction, quantity: qty,
        limitPrice: orderType === 'LIMIT' ? Number(limitPrice) : undefined,
        stopPrice: orderType === 'STOP_LOSS' ? Number(stopPrice) : undefined,
      });
      if (data.status === 'REJECTED') toast.error(`Order rejected: ${data.rejectReason}`);
      else if (data.status === 'EXECUTED') toast.success(`${direction} ${qty} ${stock?.symbol} executed at ${money(data.executedPrice, stock?.currency)}`);
      else toast.info(`Order ${data.status.toLowerCase()} — will fill when the price condition is met`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Order failed');
    }
  };

  const addToWatchlist = async () => {
    try {
      let wl = watchlists[0];
      if (!wl) {
        const { data } = await watchlistApi.create('My Watchlist');
        wl = data;
      }
      await watchlistApi.addItem(wl.id, stockId);
      toast.success(`${stock?.symbol} added to "${wl.name}"`);
      watchlistApi.list().then((r) => setWatchlists(r.data)).catch(() => {});
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Could not add to watchlist');
    }
  };

  const setAlert = async () => {
    if (!stock) return;
    const raw = window.prompt(`Alert me when ${stock.symbol} crosses price:`, String(Math.round(stock.currentPrice)));
    if (!raw) return;
    const threshold = Number(raw);
    if (!threshold) return;
    const condition = threshold >= stock.currentPrice ? 'ABOVE' : 'BELOW';
    try {
      await alertApi.create(stockId, condition, threshold);
      toast.success(`Alert set: ${stock.symbol} ${condition} ${money(threshold, stock.currency)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Could not set alert');
    }
  };

  if (!stock) return <p>Loading…</p>;
  const estTotal = qty * stock.currentPrice;
  const cur = stock.currency;
  const closed = !stock.marketOpen;

  // Day-range slider position (clamped 0..100).
  const range = stock.dayHigh - stock.dayLow;
  const rangePos = range > 0 ? Math.min(100, Math.max(0, ((stock.currentPrice - stock.dayLow) / range) * 100)) : 50;

  return (
    <div>
      <h1 className="page-title">
        {stock.symbol} <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: 18 }}>{stock.companyName}</span>
        <span className="badge badge-gray" style={{ marginLeft: 10, fontSize: 12, verticalAlign: 'middle' }}>
          {stock.market === 'US' ? '🇺🇸 US' : '🇮🇳 India'}
        </span>
      </h1>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            {/* Price header */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em' }}>{money(stock.currentPrice, cur)}</div>
              <div className={`chg-pill ${cls(stock.changePercent)}`} style={{ fontSize: 17 }}>
                {stock.changePercent >= 0 ? '▲' : '▼'} {pct(stock.changePercent)}
              </div>
              {closed && <span className="badge badge-yellow" style={{ fontSize: 12 }}>● Market closed · frozen</span>}
            </div>

            {/* Chart */}
            <div style={{ marginTop: 16 }}>
              <PriceChart candles={candles} up={stock.changePercent >= 0} />
            </div>

            {/* Stat strip */}
            <div className="stat-strip">
              <div className="cell"><div className="k">Prev Close</div><div className="v">{money(stock.previousClose, cur)}</div></div>
              <div className="cell"><div className="k">Day High</div><div className="v">{money(stock.dayHigh, cur)}</div></div>
              <div className="cell"><div className="k">Day Low</div><div className="v">{money(stock.dayLow, cur)}</div></div>
              <div className="cell"><div className="k">Volume</div><div className="v">{stock.volume.toLocaleString('en-IN')}</div></div>
              <div className="cell"><div className="k">Market</div><div className="v">{stock.market === 'US' ? 'NASDAQ/NYSE' : 'NSE'}</div></div>
            </div>

            {/* Day range slider */}
            <div className="range-row">
              <div className="labels"><span>Day Low {money(stock.dayLow, cur)}</span><span>Day High {money(stock.dayHigh, cur)}</span></div>
              <div className="range-track"><div className="range-dot" style={{ left: `${rangePos}%` }} /></div>
            </div>
          </div>

          <SignalCard signal={signal} currency={cur} />
        </div>

        {/* Order panel */}
        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 80 }}>
          <div className="stat-label" style={{ marginBottom: 14, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Place Order</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <button onClick={() => setDirection('BUY')} style={{ flex: 1 }}
              className={direction === 'BUY' ? 'btn-green' : 'btn-ghost'}>BUY</button>
            <button onClick={() => setDirection('SELL')} style={{ flex: 1 }}
              className={direction === 'SELL' ? 'btn-red' : 'btn-ghost'}>SELL</button>
          </div>
          <div className="field">
            <label>Order type</label>
            <select value={orderType} onChange={(e) => setOrderType(e.target.value as any)}>
              <option value="MARKET">Market</option>
              <option value="LIMIT">Limit</option>
              <option value="STOP_LOSS">Stop-Loss</option>
            </select>
          </div>
          <div className="field">
            <label>Quantity</label>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
          </div>
          {orderType === 'LIMIT' && (
            <div className="field">
              <label>Limit price</label>
              <input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} />
            </div>
          )}
          {orderType === 'STOP_LOSS' && (
            <div className="field">
              <label>Stop price</label>
              <input type="number" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} />
            </div>
          )}
          <div style={{ color: 'var(--text-dim)', fontSize: 13, margin: '8px 0 14px' }}>
            Est. total: <b style={{ color: 'var(--text)' }}>{money(estTotal, cur)}</b>
          </div>
          {closed && (
            <div className="error-msg" style={{ background: 'rgba(243,186,47,0.10)', color: 'var(--yellow)', border: '1px solid rgba(243,186,47,0.30)' }}>
              {stock.market === 'US' ? 'US' : 'Indian'} market is closed — trading is disabled until it reopens.
            </div>
          )}
          <button className={direction === 'BUY' ? 'btn-green' : 'btn-red'} style={{ width: '100%' }}
            onClick={placeOrder} disabled={closed}>
            {direction} {stock.symbol}
          </button>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={addToWatchlist}>+ Watchlist</button>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={setAlert}>Set Alert</button>
          </div>
        </div>
      </div>
    </div>
  );
}
