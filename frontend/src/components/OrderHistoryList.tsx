import type { Order } from '../types';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui';
import OrderHistoryItem from './OrderHistoryItem';

interface OrderHistoryListProps {
  orders: Order[];
}

function OrderHistoryList({ orders }: OrderHistoryListProps) {
  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        icon="package"
        title="No orders yet"
        text="Equipment you purchase from our lab catalog will show up here once you check out."
        action={
          <Link to="/categories" className="btn btn-primary">
            Browse equipment
          </Link>
        }
      />
    );
  }

  return (
    <div className="ds-stack">
      {orders.map((order) => (
        <OrderHistoryItem key={order.id} order={order} />
      ))}
    </div>
  );
}

export default OrderHistoryList;
export { OrderHistoryList };
