import { Media, Button, Price } from './ui';
import { Icon } from './icons';
import type { CartItem } from '../types';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const equipment = item.equipment;
  const unitPrice = equipment ? Number(equipment.price) : 0;
  const lineTotal = unitPrice * item.quantity;

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  return (
    <div className="ds-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
      <div style={{ width: '88px', flexShrink: 0 }}>
        <Media src={equipment?.imageUrl} alt={equipment?.name || 'Equipment'} ratio="square" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="ds-card-title">{equipment?.name || 'Equipment item'}</div>
        <div className="ds-card-meta">SKU: {equipment?.sku || 'N/A'}</div>
        <div className="ds-small ds-muted">
          <Price value={unitPrice} /> each
        </div>
      </div>

      <div className="ds-cluster" style={{ alignItems: 'center', gap: '0.5rem' }}>
        <Button
          variant="ghost"
          size="md"
          onClick={handleDecrease}
          disabled={item.quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Icon name="minus" size={16} />
        </Button>
        <span style={{ minWidth: '2rem', textAlign: 'center' }}>{item.quantity}</span>
        <Button
          variant="ghost"
          size="md"
          onClick={handleIncrease}
          aria-label="Increase quantity"
        >
          <Icon name="plus" size={16} />
        </Button>
      </div>

      <div style={{ minWidth: '90px', textAlign: 'right' }}>
        <Price value={lineTotal} />
      </div>

      <Button
        variant="ghost"
        size="md"
        onClick={() => onRemove(item.id)}
        aria-label="Remove item"
      >
        <Icon name="trash" size={16} />
      </Button>
    </div>
  );
}

export { CartItemRow };
export default CartItemRow;