import { Link } from 'react-router-dom';
import { Section, WithSidebar, Card, Media, Button, EmptyState, Stack, Cluster, Price } from '../components/ui';
import { Icon } from '../components/icons';
import type { CartItem } from '../types';

interface CartItemsProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  sidebar?: React.ReactNode;
}

export default function CartItems({ items, onUpdateQuantity, onRemove, sidebar }: CartItemsProps) {
  if (!items || items.length === 0) {
    return (
      <Section eyebrow="Cart" title="Your equipment cart">
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          text="Browse our lab equipment catalog to find centrifuges, microscopes, analyzers and more."
          action={<Button to="/categories">Browse categories</Button>}
        />
      </Section>
    );
  }

  return (
    <Section eyebrow="Cart" title="Your equipment cart">
      <WithSidebar sidebar={sidebar}>
        <Stack gap="md">
          {items.map((item) => {
            const equipment = item.equipment;
            const lineTotal = equipment ? equipment.price * item.quantity : 0;
            return (
              <Card key={item.id} className="ds-between">
                <Cluster gap="md" align="center">
                  <Media
                    src={equipment?.imageUrl}
                    alt={equipment?.name || 'Equipment'}
                    ratio="square"
                  />
                  <Stack gap="xs">
                    <span className="ds-card-title">{equipment?.name || 'Unknown item'}</span>
                    <span className="ds-card-meta">SKU: {equipment?.sku}</span>
                    <Price value={equipment?.price ?? 0} />
                  </Stack>
                </Cluster>
                <Stack gap="sm" align="end">
                  <Cluster gap="xs" align="center">
                    <Button
                      variant="ghost"
                      size="md"
                      aria-label="Decrease quantity"
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                      <Icon name="minus" />
                    </Button>
                    <span className="ds-small">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="md"
                      aria-label="Increase quantity"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Icon name="plus" />
                    </Button>
                  </Cluster>
                  <span className="ds-price">${Number(lineTotal || 0).toFixed(2)}</span>
                  <Button variant="danger" size="md" onClick={() => onRemove(item.id)}>
                    <Icon name="trash" /> Remove
                  </Button>
                </Stack>
              </Card>
            );
          })}
          <Cluster justify="start">
            <Link to="/categories" className="ds-btn-ghost">
              <Icon name="arrow-left" /> Continue shopping
            </Link>
          </Cluster>
        </Stack>
      </WithSidebar>
    </Section>
  );
}