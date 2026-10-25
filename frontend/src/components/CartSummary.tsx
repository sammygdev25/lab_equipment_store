import { Card, CardBody, Price, Button, Stack } from '../components/ui';
import { Icon } from '../components/icons';
import type { CartItem } from '../types';

interface CartSummaryProps {
  items: CartItem[];
  total: number;
  onCheckout: () => void;
}

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 25;

export default function CartSummary({ items, total, onCheckout }: CartSummaryProps) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = items.length === 0 || total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = total + shipping;

  return (
    <Card>
      <CardBody>
        <Stack gap="md">
          <h2 className="ds-card-title">Order Summary</h2>

          <div className="ds-between">
            <span className="ds-muted">
              Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
            <Price value={total} />
          </div>

          <div className="ds-between">
            <span className="ds-muted">Shipping</span>
            {shipping === 0 ? (
              <span className="ds-small">Free</span>
            ) : (
              <Price value={shipping} />
            )}
          </div>

          {shipping > 0 && (
            <p className="ds-help">
              <Icon name="truck" size={14} /> Add{' '}
              <Price value={FREE_SHIPPING_THRESHOLD - total} /> more for free shipping on lab
              equipment orders.
            </p>
          )}

          <div className="ds-between">
            <span className="ds-card-title">Total</span>
            <Price value={grandTotal} />
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={onCheckout}
            disabled={items.length === 0}
          >
            <Icon name="credit-card" size={16} /> Proceed to Checkout
          </Button>

          <p className="ds-small ds-muted">
            Secure checkout powered by Stripe. Orders are typically processed within 1-2 business
            days for lab equipment fulfillment.
          </p>
        </Stack>
      </CardBody>
    </Card>
  );
}