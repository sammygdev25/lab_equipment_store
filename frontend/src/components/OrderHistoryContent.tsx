import { Link } from 'react-router-dom';
import { Section, Badge, EmptyState, Button } from '../components/ui';
import { Icon } from '../components/icons';
import type { Order } from '../types';

interface OrderHistoryContentProps {
  orders: Order[];
}

function statusTone(status: string): 'neutral' | 'primary' | 'soft' | 'success' | 'danger' {
  switch (status) {
    case 'paid':
    case 'completed':
    case 'delivered':
      return 'success';
    case 'cancelled':
    case 'failed':
      return 'danger';
    case 'shipped':
    case 'processing':
      return 'primary';
    default:
      return 'neutral';
  }
}

export default function OrderHistoryContent({ orders }: OrderHistoryContentProps) {
  if (!orders || orders.length === 0) {
    return (
      <Section
        eyebrow="Order history"
        title="Your lab equipment orders"
      >
        <EmptyState
          icon="package"
          title="No orders yet"
          text="Browse our catalog of lab equipment and place your first order."
          action={
            <Link to="/categories">
              <Button>Browse categories</Button>
            </Link>
          }
        />
      </Section>
    );
  }

  return (
    <Section
      eyebrow="Order history"
      title="Your lab equipment orders"
      subtitle="Track every purchase of lab equipment from request to delivery."
    >
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Placed</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  {order.items?.length
                    ? `${order.items.length} item${order.items.length > 1 ? 's' : ''}`
                    : '—'}
                </td>
                <td>${order.totalAmount.toFixed(2)}</td>
                <td>
                  <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                </td>
                <td>
                  <Link to={`/orders/${order.id}`} className="ds-cluster">
                    View details <Icon name="arrow-right" size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
