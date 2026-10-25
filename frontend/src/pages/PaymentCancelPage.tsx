import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function PaymentCancelPage() {
  const [params] = useSearchParams();
  const order = params.get('order');
  return (
    <div style={{ maxWidth: '520px', margin: '80px auto', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Payment cancelled</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>Nothing was charged.</p>
      {order && <p style={{ marginBottom: '1rem' }}><Link to={`/order-pay?order=${order}`} style={{ color: 'var(--color-primary)' }}>Try again</Link></p>}
      <Link to="/" style={{ color: 'var(--color-primary)' }}>Back to the site</Link>
    </div>
  );
}
