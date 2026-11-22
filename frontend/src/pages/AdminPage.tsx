import { useEffect, useState } from 'react';
import { adminApi, stockApi } from '../services/api';
import type { Stock } from '../types';
import { inr } from '../services/format';

interface AdminUser {
  id: number; fullName: string; email: string; role: string;
  verified: boolean; suspended: boolean; createdAt: string;
}
interface Metrics {
  totalUsers: number; activeTraders: number; totalOrders: number;
  executedOrders: number; pendingOrders: number; totalTradeVolume: number;
  stocksBySector: { sector: string; count: number }[];
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [overrideStock, setOverrideStock] = useState<number | ''>('');
  const [overridePrice, setOverridePrice] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    adminApi.metrics().then((r) => setMetrics(r.data as Metrics)).catch(() => {});
    adminApi.users().then((r) => setUsers(r.data as AdminUser[])).catch(() => {});
  };
  useEffect(() => {
    load();
    stockApi.list('', 0, 50).then((r) => { setStocks(r.data.content); if (r.data.content[0]) setOverrideStock(r.data.content[0].id); });
  }, []);

  const toggleSuspend = async (u: AdminUser) => {
    await adminApi.suspend(u.id, !u.suspended);
    load();
  };

  const doOverride = async () => {
    setMsg('');
    if (!overrideStock || !overridePrice) return;
    try {
      await adminApi.overridePrice(Number(overrideStock), Number(overridePrice));
      setMsg('Price overridden');
      setOverridePrice('');
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Override failed');
    }
  };

  return (
    <div>
      <h1 className="page-title">Admin Panel</h1>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <div className="card"><div className="stat-label">Total Users</div><div className="stat-value">{metrics?.totalUsers ?? '—'}</div></div>
        <div className="card"><div className="stat-label">Active Traders</div><div className="stat-value">{metrics?.activeTraders ?? '—'}</div></div>
        <div className="card"><div className="stat-label">Orders (exec/pending)</div>
          <div className="stat-value">{metrics?.executedOrders ?? '—'}<span style={{ fontSize: 14, color: 'var(--text-dim)' }}> / {metrics?.pendingOrders ?? '—'}</span></div></div>
        <div className="card"><div className="stat-label">Trade Volume</div><div className="stat-value">{inr(metrics?.totalTradeVolume)}</div></div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="stat-label" style={{ marginBottom: 12 }}>Price Override</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={overrideStock} onChange={(e) => setOverrideStock(Number(e.target.value))} style={{ maxWidth: 240 }}>
            {stocks.map((s) => <option key={s.id} value={s.id}>{s.symbol} — {inr(s.currentPrice)}</option>)}
          </select>
          <input type="number" placeholder="New price" value={overridePrice} onChange={(e) => setOverridePrice(e.target.value)} style={{ maxWidth: 160 }} />
          <button className="btn-primary" onClick={doOverride}>Override</button>
          {msg && <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>{msg}</span>}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td style={{ color: 'var(--text-dim)' }}>{u.email}</td>
                <td><span className="badge badge-blue">{u.role}</span></td>
                <td><span className={`badge ${u.suspended ? 'badge-red' : 'badge-green'}`}>
                  {u.suspended ? 'SUSPENDED' : 'ACTIVE'}</span></td>
                <td style={{ textAlign: 'right' }}>
                  {u.role !== 'ADMIN' && (
                    <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => toggleSuspend(u)}>
                      {u.suspended ? 'Activate' : 'Suspend'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
