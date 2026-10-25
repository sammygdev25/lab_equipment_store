import { Link } from 'react-router-dom';
import { Card, CardBody, CardTitle, CardMeta, CardFooter, Price, Badge, Stack } from './ui';
import { Icon } from './icons';
import type { Order } from '../types';

interface OrderHistoryItemProps {
  order: Order;
}

function statusTone(status: string): 'neutral' | 'primary' | 'soft' | 'success' | 'danger' {
  switch (status) {
    case 'paid':
    case 'completed':
    case 'fulfilled':
      return 'success';
    case 'cancelled':
    case 'failed':
      return 'danger';
    case 'processing':
      return 'primary';
    default:
      return 'soft';
  }
}

function OrderHistoryItem({ order }: OrderHistoryItemProps) {
  const itemCount = order.items?.length ?? 0;
  const createdAt = new Date(order.createdAt);

  return (
    <Card>
      <CardBody>
        <Stack gap="sm">
          <div className="ds-between">
            <CardTitle>Order #{order.id}</CardTitle>
            <Badge tone={statusTone(order.status)}>{order.status}</Badge>
          </div>
          <CardMeta>
            <Icon name="calendar" size={14} /> {createdAt.toLocaleDateString()}
            {itemCount > 0 && (
              <>
                {' '}· <Icon name="package" size={14} /> {itemCount} item{itemCount === 1 ? '' : 's'}
              </>
            )}
          </CardMeta>
          {order.items && order.items.length > 0 && (
            <div className="ds-muted ds-small">
              {order.items
                .slice(0, 3)
                .map((item) => item.equipment?.name)
                .filter(Boolean)
                .join(', ')}
              {order.items.length > 3 ? '…' : ''}
            </div>
          )}
        </Stack>
      </CardBody>
      <CardFooter>
        <Price value={Number(order.totalAmount)} />
        <Link to={`/orders/${order.id}`} className="btn btn-secondary">
          View details
        </Link>
      </CardFooter>
    </Card>
  );
}

export default OrderHistoryItem;
export { OrderHistoryItem };