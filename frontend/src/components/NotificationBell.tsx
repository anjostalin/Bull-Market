import { useEffect, useRef, useState } from 'react';
import { notificationApi } from '../services/api';
import type { Notification as Notif } from '../types';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = () => notificationApi.unreadCount().then((r) => setCount(r.data.count)).catch(() => {});

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      const { data } = await notificationApi.list(0, 10);
      setItems(data.content);
    }
  };

  const markAll = async () => {
    await notificationApi.markAllRead();
    setCount(0);
    const { data } = await notificationApi.list(0, 10);
    setItems(data.content);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn-ghost" onClick={toggle} style={{ position: 'relative' }}>
        🔔
        {count > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6, background: 'var(--red)', color: '#fff',
            borderRadius: 10, fontSize: 11, padding: '1px 6px', fontWeight: 700,
          }}>{count}</span>
        )}
      </button>
      {open && (
        <div className="card" style={{
          position: 'absolute', right: 0, top: 48, width: 340, zIndex: 50,
          maxHeight: 420, overflowY: 'auto', boxShadow: 'var(--shadow)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <b>Notifications</b>
            {count > 0 && <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={markAll}>Mark all read</button>}
          </div>
          {items.length === 0 && <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>No notifications.</div>}
          {items.map((n) => (
            <div key={n.id} style={{
              padding: '10px 0', borderBottom: '1px solid var(--border)',
              opacity: n.read ? 0.55 : 1,
            }}>
              <div style={{ fontSize: 14 }}>{n.message}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                {new Date(n.createdAt).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
