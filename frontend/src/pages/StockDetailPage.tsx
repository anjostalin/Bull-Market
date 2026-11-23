import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createChart, ColorType } from 'lightweight-charts';
import { alertApi, orderApi, signalApi, stockApi, watchlistApi } from '../services/api';
import type { Candle, SignalView, Stock, WatchlistView } from '../types';
import { money, pct, cls } from '../services/format';
import SignalCard from '../components/SignalCard';

export default function StockDetailPage() {
  const { id } = useParams();
  const stockId = Number(id);
  const [stock, setStock] = useState<Stock | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [signal, setSignal] = useState<SignalView | null>(null);
  const [watchlists, setWatchlists] = useState<WatchlistView[]>([]);
  const [actionMsg, setActionMsg] = useState('');
  const chartRef = useRef<HTMLDivElement>(null);

  // order form
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP_LOSS'>('MARKET');
  const [qty, setQty] = useState(1);
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

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

  useEffect(() => {
    if (!chartRef.current || candles.length === 0) return;
    const chart = createChart(chartRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#141925' }, textColor: '#8b93a7' },
      grid: { vertLines: { color: '#272e3f' }, horzLines: { color: '#272e3f' } },
      width: chartRef.current.clientWidth, height: 320,
      timeScale: { timeVisible: true },
    });
    const series = chart.addCandlestickSeries({
      upColor: '#16c784', downColor: '#ea3943', borderVisible: false,
      wickUpColor: '#16c784', wickDownColor: '#ea3943',
    });
    series.setData(candles.map((c) => ({
      time: c.date, open: c.open, high: c.high, low: c.low, close: c.close,
    })) as any);
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [candles]);

  const placeOrder = async () => {
    setMsg(null);
    try {
      const { data } = await orderApi.place({
        stockId, orderType, direction, quantity: qty,
        limitPrice: orderType === 'LIMIT' ? Number(limitPrice) : undefined,
        stopPrice: orderType === 'STOP_LOSS' ? Number(stopPrice) : undefined,
      });
      if (data.status === 'REJECTED') setMsg({ ok: false, text: `Rejected: ${data.rejectReason}` });
      else if (data.status === 'EXECUTED') setMsg({ ok: true, text: `Executed at ${money(data.executedPrice, stock?.currency)}` });
      else setMsg({ ok: true, text: `Order ${data.status.toLowerCase()} (will fill when price condition is met)` });
    } catch (err: any) {
      setMsg({ ok: false, text: err.response?.data?.error || 'Order failed' });
    }
  };

  const addToWatchlist = async () => {
    setActionMsg('');
    try {
      let wl = watchlists[0];
      if (!wl) {
        const { data } = await watchlistApi.create('My Watchlist');
        wl = data;
      }
      await watchlistApi.addItem(wl.id, stockId);
      setActionMsg(`Added to "${wl.name}"`);
      watchlistApi.list().then((r) => setWatchlists(r.data)).catch(() => {});
    } catch (err: any) {
      setActionMsg(err.response?.data?.error || 'Could not add to watchlist');
    }
  };

  const setAlert = async () => {
    if (!stock) return;
    setActionMsg('');
    const raw = window.prompt(`Alert me when ${stock.symbol} crosses price:`, String(Math.round(stock.currentPrice)));
    if (!raw) return;
    const threshold = Number(raw);
    if (!threshold) return;
    const condition = threshold >= stock.currentPrice ? 'ABOVE' : 'BELOW';
    try {
      await alertApi.create(stockId, condition, threshold);
      setActionMsg(`Alert set: ${condition} ${money(threshold, stock.currency)}`);
    } catch (err: any) {
      setActionMsg(err.response?.data?.error || 'Could not set alert');
    }
  };

  if (!stock) return <p>Loading…</p>;
  const estTotal = qty * stock.currentPrice;
  const cur = stock.currency;
  const closed = !stock.marketOpen;

  return (
    <div>
      <h1 className="page-title">
        {stock.symbol} — {stock.companyName}
        <span className="badge badge-gray" style={{ marginLeft: 10, fontSize: 12, verticalAlign: 'middle' }}>
          {stock.market === 'US' ? '🇺🇸 US' : '🇮🇳 India'}
        </span>
      </h1>
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{money(stock.currentPrice, cur)}</div>
              <div className={cls(stock.changePercent)} style={{ fontSize: 18 }}>{pct(stock.changePercent)}</div>
              {closed && <span className="badge badge-yellow" style={{ fontSize: 12 }}>Market closed · frozen</span>}
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 6 }}>
              Prev close {money(stock.previousClose, cur)} · High {money(stock.dayHigh, cur)} · Low {money(stock.dayLow, cur)} · Vol {stock.volume.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="card">
            <div className="stat-label" style={{ marginBottom: 12 }}>Price Chart (OHLCV)</div>
            {candles.length > 0
              ? <div ref={chartRef} />
              : <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Candle data builds as the OHLCV job runs (every ~15s).</p>}
          </div>
        </div>

        <div className="card" style={{ height: 'fit-content' }}>
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
          {msg && <div className={msg.ok ? 'ok-msg' : 'error-msg'}>{msg.text}</div>}
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
          {actionMsg && <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 8 }}>{actionMsg}</div>}

          <SignalCard signal={signal} />
        </div>
      </div>
    </div>
  );
}
