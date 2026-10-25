import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { unpaidOrders } from '../lib/payments';
import type { UnpaidOrder } from '../lib/payments';

// Scaffold-owned (PX.151): an order the signed-in customer has not paid is offered here, above
// every page, whatever the app's own pages show; it is read again on every page change.
export default function UnpaidNotice() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const [orders, setOrders] = useState<UnpaidOrder[]>([]);
  useEffect(() => {
    let live = true;
    if (isAuthenticated) {
      unpaidOrders().then((o) => { if (live) setOrders(o); }).catch(() => { if (live) setOrders([]); });
    } else {
      setOrders([]);
    }
    return () => { live = false; };
  }, [isAuthenticated, pathname]);
  if (orders.length === 0 || pathname.startsWith('/order-pay') || pathname.startsWith('/payment-')) return null;
  const first = orders[0];
  return (
    <div role="status" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)',
      padding: '0.6rem 1rem', textAlign: 'center', color: 'var(--color-text)' }}>
      Order #{first.id} is waiting for payment ({first.amount.toFixed(2)}).{' '}
      <Link to={`/order-pay?order=${first.id}`} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Pay now</Link>
      {orders.length > 1 ? ` (${orders.length - 1} more)` : ''}
    </div>
  );
}
