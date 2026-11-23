import { useEffect, useMemo, useState } from 'react';
import { orderApi } from '../services/api';
import type { OrderView } from '../types';

const statusBadge: Record<string, string> = {
  EXECUTED: 'badge-green', PENDING: 'badge-yellow', CANCELLED: 'badge-gray', REJECTED: 'badge-red',
};

const num = (n: number | null | undefined) =>
  n == null ? '—' : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Filter = 'ALL' | 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');

  const load = () => orderApi.list(0, 100).then((r) => setOrders(r.data.content)).catch(() => {});
  useEffect(() => {
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  const cancel = async (id: number) => { await orderApi.cancel(id); load(); };

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: orders.length, PENDING: 0, EXECUTED: 0, CANCELLED: 0, REJECTED: 0 };
    orders.forEach((o) => { c[o.status] = (c[o.status] ?? 0) + 1; });
    return c;
  }, [orders]);

  const rows = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);
  const tabs: Filter[] = ['ALL', 'PENDING', 'EXECUTED', 'CANCELLED', 'REJECTED'];

  return (
    <div>
      <h1 className="page-title">Orders</h1>

      <div className="seg" style={{ marginBottom: 16 }}>
        {tabs.map((t) => (
          <button key={t} className={`seg-btn ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t.charAt(0) + t.slice(1).toLowerCase()} <span style={{ opacity: 0.6 }}>{counts[t] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Symbol</th><th>Type</th><th>Side</th>
              <th style={{ textAlign: 'right' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th>Status</th><th>Time</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 700 }}>{o.symbol}</td>
                <td><span className="badge badge-gray">{o.orderType}</span></td>
                <td><span className={`badge ${o.direction === 'BUY' ? 'badge-green' : 'badge-red'}`}>{o.direction}</span></td>
                <td style={{ textAlign: 'right' }}>{o.quantity}</td>
                <td style={{ textAlign: 'right' }}>
                  {o.executedPrice ? num(o.executedPrice)
                    : o.limitPrice ? `Limit ${num(o.limitPrice)}`
                    : o.stopPrice ? `Stop ${num(o.stopPrice)}` : '—'}
                </td>
                <td><span className={`badge ${statusBadge[o.status]}`}>{o.status}</span>
                  {o.rejectReason && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{o.rejectReason}</div>}
                </td>
                <td style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                  {new Date(o.createdAt).toLocaleString('en-IN')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {o.status === 'PENDING' && (
                    <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => cancel(o.id)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={8}>
                <div className="empty-state">
                  <div className="ico">🧾</div>
                  <h4>{filter === 'ALL' ? 'No orders yet' : `No ${filter.toLowerCase()} orders`}</h4>
                  <p>{filter === 'ALL' ? 'Place your first trade from the Market and it will show up here.' : 'Try a different filter.'}</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
