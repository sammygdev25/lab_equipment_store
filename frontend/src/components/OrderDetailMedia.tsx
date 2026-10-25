import { Section, Split, Media, Badge, Price, Button, CardMeta } from '../components/ui';
import { Icon } from '../components/icons';
import type { Order } from '../types';

interface OrderDetailMediaProps {
  order: Order;
}

const STATUS_TONE: Record<string, 'neutral' | 'primary' | 'soft' | 'success' | 'danger'> = {
  pending: 'neutral',
  processing: 'primary',
  shipped: 'soft',
  delivered: 'success',
  cancelled: 'danger',
};

export default function OrderDetailMedia({ order }: OrderDetailMediaProps) {
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const createdAt = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const tone = STATUS_TONE[order.status] ?? 'neutral';
  const needsPayment = order.status === 'pending';

  return (
    <Section tight>
      <Split>
        <Media
          ratio="wide"
          badge={<Badge tone={tone}>{order.status}</Badge>}
          title="Lab equipment order"
          icon={<Icon name="package" size={32} />}
        />
        <div className="ds-stack">
          <span className="ds-eyebrow">Order #{order.id}</span>
          <h1 className="ds-card-title">Equipment Order #{order.id}</h1>
          <CardMeta>
            Placed on {createdAt} &middot; {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </CardMeta>
          <Price value={order.totalAmount} />
          <p className="ds-muted ds-small">
            Shipping to: {order.shippingAddress}
          </p>
          {needsPayment ? (
            <Button variant="primary" size="lg" to={`/order-pay?order=${order.id}`}>
              <Icon name="credit-card" size={18} /> Pay now
            </Button>
          ) : (
            <Button variant="secondary" size="lg" disabled>
              <Icon name="check" size={18} /> Payment received
            </Button>
          )}
        </div>
      </Split>
    </Section>
  );
}
