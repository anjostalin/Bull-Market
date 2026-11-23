import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertApi, watchlistApi } from '../services/api';
import type { AlertView, WatchlistView } from '../types';
import { inr, pct, cls } from '../services/format';

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState<WatchlistView[]>([]);
  const [alerts, setAlerts] = useState<AlertView[]>([]);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  const load = () => {
    watchlistApi.list().then((r) => setWatchlists(r.data)).catch(() => {});
    alertApi.list().then((r) => setAlerts(r.data)).catch(() => {});
  };

  useEffect(() => {
    load();
    const iv = setInterval(() => watchlistApi.list().then((r) => setWatchlists(r.data)).catch(() => {}), 5000);
    return () => clearInterval(iv);
  }, []);

  const createWl = async () => {
    if (!newName.trim()) return;
    await watchlistApi.create(newName.trim());
    setNewName('');
    load();
  };

  const removeItem = async (wlId: number, stockId: number) => {
    await watchlistApi.removeItem(wlId, stockId);
    load();
  };

  const deleteAlert = async (id: number) => {
    await alertApi.remove(id);
    load();
  };

  return (
    <div>
      <h1 className="page-title">Watchlists & Alerts</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, maxWidth: 420 }}>
          <input placeholder="New watchlist name…" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button className="btn-primary" onClick={createWl}>Create</button>
        </div>
      </div>

      {watchlists.length === 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="empty-state">
            <div className="ico">⭐</div>
            <h4>No watchlists yet</h4>
            <p>Create one above, or tap “+ Watchlist” on any stock’s detail page to start tracking it.</p>
          </div>
        </div>
      )}

      {watchlists.map((wl) => (
        <div className="card" style={{ marginBottom: 16, padding: 0 }} key={wl.id}>
          <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <b>⭐ {wl.name}</b>
            <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}
              onClick={async () => { await watchlistApi.remove(wl.id); load(); }}>Delete list</button>
          </div>
          <table>
            <thead>
              <tr><th>Symbol</th><th>Company</th><th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Change</th><th></th></tr>
            </thead>
            <tbody>
              {wl.items.map((it) => (
                <tr key={it.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/stock/${it.stockId}`)}>
                  <td style={{ fontWeight: 700 }}>{it.symbol}</td>
                  <td style={{ color: 'var(--text-dim)' }}>{it.companyName}</td>
                  <td style={{ textAlign: 'right' }}>{inr(it.currentPrice)}</td>
                  <td className={cls(it.changePercent)} style={{ textAlign: 'right' }}>{pct(it.changePercent)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={(e) => { e.stopPropagation(); removeItem(wl.id, it.stockId); }}>Remove</button>
                  </td>
                </tr>
              ))}
              {wl.items.length === 0 && <tr><td colSpan={5} style={{ color: 'var(--text-dim)' }}>No stocks. Add from a stock page.</td></tr>}
            </tbody>
          </table>
        </div>
      ))}

      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '26px 0 14px' }}>🔔 Price Alerts</h2>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>Symbol</th><th>Condition</th><th style={{ textAlign: 'right' }}>Threshold</th>
              <th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 700 }}>{a.symbol}</td>
                <td><span className="badge badge-gray">{a.condition}</span></td>
                <td style={{ textAlign: 'right' }}>{inr(a.threshold)}</td>
                <td><span className={`badge ${a.active ? 'badge-yellow' : 'badge-green'}`}>
                  {a.active ? 'ACTIVE' : 'TRIGGERED'}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}
                    onClick={() => deleteAlert(a.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {alerts.length === 0 && (
              <tr><td colSpan={5}>
                <div className="empty-state">
                  <div className="ico">🔔</div>
                  <h4>No price alerts</h4>
                  <p>Open any stock and tap “Set Alert” to get notified when it crosses a price.</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
