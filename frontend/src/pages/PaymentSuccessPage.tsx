import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentStatus } from '../lib/payments';

// Stripe sends the browser here; the page asks the backend until the webhook has marked the order paid.
export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id') || '';
  const [state, setState] = useState<{ orderId?: number; paid: boolean; done: boolean }>({ paid: false, done: !sessionId });
  useEffect(() => {
    if (!sessionId) return;
    let tries = 0;
    let stopped = false;
    const tick = async () => {
      try {
        const s = await paymentStatus(sessionId);
        if (stopped) return;
        if (s.paid || tries >= 10) { setState({ orderId: s.orderId, paid: s.paid, done: true }); return; }
      } catch {
        if (tries >= 10) { setState({ paid: false, done: true }); return; }
      }
      tries += 1;
      setTimeout(tick, 2000);
    };
    tick();
    return () => { stopped = true; };
  }, [sessionId]);
  const title = !state.done ? 'Confirming your payment...' : state.paid ? 'Payment received' : 'Payment not confirmed yet';
  const text = !state.done ? 'This takes a few seconds.' : state.paid ? `Order #${state.orderId} is paid. Thank you.` : 'If you were charged, the order will show as paid shortly.';
  return (
    <div style={{ maxWidth: '520px', margin: '80px auto', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>{title}</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>{text}</p>
      <Link to="/" style={{ color: 'var(--color-primary)' }}>Back to the site</Link>
    </div>
  );
}
