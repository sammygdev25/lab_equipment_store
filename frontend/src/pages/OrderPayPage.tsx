import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { payableOrder } from '../lib/payments';
import type { PayableOrder } from '../lib/payments';
import PayButton from '../components/PayButton';

// Scaffold-owned: /order-pay?order=<id> loads one order of the signed-in user and offers Stripe Checkout for it.
export default function OrderPayPage() {
  const [params] = useSearchParams();
  const id = Number(params.get('order') || '');
  const [order, setOrder] = useState<PayableOrder | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) { setError('No order was given.'); return; }
    payableOrder(id).then(setOrder).catch(() => setError('This order could not be loaded.'));
  }, [id]);
  const row = (label: string, value: React.ReactNode) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span><span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{value}</span>
    </div>
  );
  const paid = Boolean(order?.paid);
  const amount = order ? order.amount : 0;
  return (
    <div style={{ maxWidth: '520px', margin: '60px auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem', color: 'var(--color-text)' }}>Pay for your order</h1>
      {error && <div style={{ color: 'var(--color-error, #ef4444)', marginBottom: '1rem' }}>{error}</div>}
      {order && (
        <div style={{ background: 'var(--color-surface)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
          {row('Order', `#${order.id}`)}
          {row('Total', Number(amount || 0).toFixed(2))}
          {row('Status', paid ? 'Paid' : 'Awaiting payment')}
          <div style={{ marginTop: '1.5rem' }}><PayButton orderId={order.id} paid={paid} /></div>
        </div>
      )}
      <p style={{ marginTop: '1.5rem' }}><Link to="/" style={{ color: 'var(--color-primary)' }}>Back to the site</Link></p>
    </div>
  );
}
