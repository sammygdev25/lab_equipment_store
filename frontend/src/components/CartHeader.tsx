import { PageHeader } from '../components/ui';
import { Icon } from '../components/icons';

interface CartHeaderProps {
  itemCount: number;
}

export default function CartHeader({ itemCount }: CartHeaderProps) {
  return (
    <PageHeader
      eyebrow="Your Order"
      title="Shopping Cart"
      subtitle={
        itemCount > 0
          ? `${itemCount} item${itemCount === 1 ? '' : 's'} ready for checkout`
          : 'Review the lab equipment you plan to order'
      }
      actions={
        <span className="ds-cluster" style={{ gap: 'var(--space-xs, 6px)' }}>
          <Icon name="cart" size={18} title="Cart items" />
          <span className="ds-muted">{itemCount} in cart</span>
        </span>
      }
    />
  );
}