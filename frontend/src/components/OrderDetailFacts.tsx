import { Section, Grid, Badge, Price } from '../components/ui';
import { Icon } from '../components/icons';
import type { Order } from '../types';

interface OrderDetailFactsProps {
  order: Order;
}

function statusTone(status: string): 'neutral' | 'primary' | 'soft' | 'success' | 'danger' {
  switch (status) {
    case 'paid':
    case 'fulfilled':
    case 'completed':
      return 'success';
    case 'cancelled':
    case 'failed':
      return 'danger';
    case 'processing':
    case 'shipped':
      return 'primary';
    default:
      return 'soft';
  }
}

function formatDate(value?: string | null): string {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function OrderDetailFacts({ order }: OrderDetailFactsProps) {
  return (
    <Section eyebrow="Order details" title={`Order #${order.id}`}>
      <Grid size="md" cols={2}>
        <div className="ds-field">
          <span className="ds-label">
            <Icon name="info" size={16} /> Status
          </span>
          <div>
            <Badge tone={statusTone(order.status)}>{order.status}</Badge>
          </div>
        </div>

        <div className="ds-field">
          <span className="ds-label">
            <Icon name="dollar" size={16} /> Total amount
          </span>
          <Price value={order.totalAmount} />
        </div>

        <div className="ds-field">
          <span className="ds-label">
            <Icon name="calendar" size={16} /> Placed on
          </span>
          <span>{formatDate(order.createdAt)}</span>
        </div>

        <div className="ds-field">
          <span className="ds-label">
            <Icon name="refresh" size={16} /> Last updated
          </span>
          <span>{formatDate(order.updatedAt)}</span>
        </div>

        <div className="ds-field">
          <span className="ds-label">
            <Icon name="credit-card" size={16} /> Payment reference
          </span>
          <span className="ds-muted">
            {order.stripePaymentIntentId ? order.stripePaymentIntentId : 'Not yet processed'}
          </span>
        </div>

        <div className="ds-field">
          <span className="ds-label">
            <Icon name="map-pin" size={16} /> Shipping address
          </span>
          <p className="ds-small">{order.shippingAddress}</p>
        </div>
      </Grid>
    </Section>
  );
}