import { Card, CardBody, Price, Button, Stack, Cluster } from '../components/ui';
import { Icon } from '../components/icons';
import type { CartItem } from '../types';

interface CheckoutSummaryProps {
  items: CartItem[];
  total: number;
  onSubmit: () => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function CheckoutSummary({ items, total, onSubmit, loading, submitLabel }: CheckoutSummaryProps) {
  const shipping = items.length > 0 ? 0 : 0;

  return (
    <Card>
      <CardBody>
        <Stack gap="md">
          <h2 className="ds-card-title">Order summary</h2>
          {items.length === 0 ? (
            <p className="ds-muted">Your cart is empty.</p>
          ) : (
            <ul className="ds-stack" style={{ gap: 'var(--space-sm, 0.75rem)' }}>
              {items.map((item) => (
                <li key={item.id}>
                  <Cluster align="center" justify="between">
                    <Cluster align="center" gap="sm">
                      <div style={{ width: 48, height: 48 }}>
                        <Media
                          src={item.equipment?.imageUrl}
                          alt={item.equipment?.name || 'Equipment'}
                          ratio="square"
                        />
                      </div>
                      <div>
                        <div className="ds-small">{item.equipment?.name || 'Equipment'}</div>
                        <div className="ds-muted ds-small">Qty {item.quantity}</div>
                      </div>
                    </Cluster>
                    <Price
                      value={(item.equipment?.price || 0) * item.quantity}
                    />
                  </Cluster>
                </li>
              ))}
            </ul>
          )}

          <div className="ds-card-footer">
            <Cluster justify="between" align="center">
              <span className="ds-muted">Shipping</span>
              <span className="ds-small">{shipping === 0 ? 'Free' : <Price value={shipping} />}</span>
            </Cluster>
            <Cluster justify="between" align="center">
              <span className="ds-card-title">Total</span>
              <Price value={total} />
            </Cluster>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={onSubmit}
            disabled={loading || items.length === 0}
          >
            {loading ? (
              <Cluster gap="sm" align="center">
                <Icon name="refresh" size={16} />
                <span>Processing...</span>
              </Cluster>
            ) : (
              submitLabel || 'Place order'
            )}
          </Button>

          <p className="ds-muted ds-small">
            <Icon name="shield" size={14} /> Secure checkout for lab equipment orders. Payment is processed via Stripe.
          </p>
        </Stack>
      </CardBody>
    </Card>
  );
}

import { Media } from '../components/ui';