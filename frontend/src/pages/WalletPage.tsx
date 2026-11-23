import { useEffect, useState } from 'react';
import { walletApi } from '../services/api';
import type { Wallet, WalletTransaction } from '../types';
import { money } from '../services/format';

const typeBadge: Record<string, string> = {
  DEPOSIT: 'badge-green', SELL: 'badge-green', WITHDRAWAL: 'badge-red', BUY: 'badge-blue',
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txns, setTxns] = useState<WalletTransaction[]>([]);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [msg, setMsg] = useState('');

  const load = () => {
    walletApi.get().then((r) => setWallet(r.data)).catch(() => {});
    walletApi.transactions(0, 50).then((r) => setTxns(r.data.content)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const act = async (fn: (n: number, c: 'INR' | 'USD') => Promise<any>) => {
    setMsg('');
    const n = Number(amount);
    if (!n || n <= 0) { setMsg('Enter a positive amount'); return; }
    try { await fn(n, currency); setAmount(''); load(); }
    catch (err: any) { setMsg(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div>
      <h1 className="page-title">Wallet</h1>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="stat-label">🇮🇳 INR Balance</div>
          <div className="stat-value">{money(wallet?.balanceInr, 'INR')}</div>
        </div>
        <div className="card">
          <div className="stat-label">🇺🇸 USD Balance</div>
          <div className="stat-value">{money(wallet?.balanceUsd, 'USD')}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="stat-label" style={{ marginBottom: 12 }}>Add / Remove Funds</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={currency} onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD')} style={{ maxWidth: 140 }}>
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
          </select>
          <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ maxWidth: 200 }} />
          <button className="btn-green" onClick={() => act(walletApi.deposit)}>Deposit</button>
          <button className="btn-red" onClick={() => act(walletApi.withdraw)}>Withdraw</button>
        </div>
        {msg && <div className="error-msg" style={{ marginTop: 12 }}>{msg}</div>}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>Type</th><th>Note</th><th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'right' }}>Balance After</th><th>Time</th></tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id}>
                <td><span className={`badge ${typeBadge[t.type]}`}>{t.type}</span></td>
                <td style={{ color: 'var(--text-dim)' }}>{t.note}</td>
                <td style={{ textAlign: 'right' }}>{money(t.amount, t.currency)}</td>
                <td style={{ textAlign: 'right' }}>{money(t.balanceAfter, t.currency)}</td>
                <td style={{ color: 'var(--text-dim)', fontSize: 13 }}>{new Date(t.createdAt).toLocaleString('en-IN')}</td>
              </tr>
            ))}
            {txns.length === 0 && <tr><td colSpan={5} style={{ color: 'var(--text-dim)' }}>No transactions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
