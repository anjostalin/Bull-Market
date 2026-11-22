import { useEffect, useState } from 'react';
import { orderApi } from '../services/api';
import type { OrderView } from '../types';
import { inr } from '../services/format';

const statusBadge: Record<string, string> = {
  EXECUTED: 'badge-green', PENDING: 'badge-yellow', CANCELLED: 'badge-gray', REJECTED: 'badge-red',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderView[]>([]);

  const load = () => orderApi.list(0, 50).then((r) => setOrders(r.data.content)).catch(() => {});
  useEffect(() => {
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  const cancel = async (id: number) => { await orderApi.cancel(id); load(); };

  return (
    <div>
      <h1 className="page-title">Orders</h1>
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
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 700 }}>{o.symbol}</td>
                <td>{o.orderType}</td>
                <td><span className={o.direction === 'BUY' ? 'pos' : 'neg'}>{o.direction}</span></td>
                <td style={{ textAlign: 'right' }}>{o.quantity}</td>
                <td style={{ textAlign: 'right' }}>
                  {o.executedPrice ? inr(o.executedPrice)
                    : o.limitPrice ? `Limit ${inr(o.limitPrice)}`
                    : o.stopPrice ? `Stop ${inr(o.stopPrice)}` : '—'}
                </td>
                <td><span className={`badge ${statusBadge[o.status]}`}>{o.status}</span>
                  {o.rejectReason && <div style={{ fontSize: 11, color: 'var(--red)' }}>{o.rejectReason}</div>}
                </td>
                <td style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                  {new Date(o.createdAt).toLocaleString('en-IN')}
                </td>
                <td>
                  {o.status === 'PENDING' && (
                    <button className="btn-ghost" onClick={() => cancel(o.id)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={8} style={{ color: 'var(--text-dim)' }}>No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
