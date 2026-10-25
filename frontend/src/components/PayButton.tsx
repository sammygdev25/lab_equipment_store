import React, { useState } from 'react';
import { startCheckout } from '../lib/payments';

interface Props { orderId: number; paid?: boolean; label?: string; }
type ApiError = { response?: { data?: { code?: string; error?: string } } };

// Starts a Stripe Checkout for one order and sends the browser to Stripe's page; says why when payments are off.
export default function PayButton({ orderId, paid, label }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (paid) return <span style={{ color: 'var(--color-success, #16a34a)', fontWeight: 600 }}>Paid</span>;
  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      const { url } = await startCheckout(orderId);
      window.location.assign(url);
    } catch (err) {
      const data = (err as ApiError).response?.data;
      setError(data?.code === 'payments_unavailable' ? 'Payments are not set up for this app yet.' : (data?.error || 'Could not start the payment'));
      setBusy(false);
    }
  };
  return (
    <div>
      <button type="button" onClick={pay} disabled={busy} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{busy ? 'Redirecting...' : (label || 'Pay now')}</button>
      {error && <div style={{ color: 'var(--color-error, #ef4444)', marginTop: '0.5rem' }}>{error}</div>}
    </div>
  );
}
