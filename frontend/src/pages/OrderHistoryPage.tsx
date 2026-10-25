import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOrderList } from '../api';
import type { Order } from '../types';
import OrderHistoryHeader from '../components/OrderHistoryHeader';
import OrderHistoryContent from '../components/OrderHistoryContent';
import OrderHistoryDetails from '../components/OrderHistoryDetails';
import { LoadingBlock } from '../components/ui';
import { Alert } from '../components/ui';

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getOrderList();
        if (active) setOrders(data);
      } catch (err) {
        console.error(err);
        if (active) setError('Failed to load your orders. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  if (loading) {
    return <LoadingBlock label="Loading your orders..." />;
  }

  return (
    <div className="ds-stack-lg">
      <OrderHistoryHeader userName={user?.name || user?.email} orderCount={orders.length} />
      {error && <Alert tone="danger">{error}</Alert>}
      <OrderHistoryContent orders={orders} />
      <OrderHistoryDetails user={user} orderCount={orders.length} totalSpent={totalSpent} />
    </div>
  );
}