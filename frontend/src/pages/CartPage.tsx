import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import CartHeader from '../components/CartHeader';
import CartItems from '../components/CartItems';
import CartSummary from '../components/CartSummary';
import { LoadingBlock } from '../components/ui';

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem, loading } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return <LoadingBlock label="Loading your cart..." />;
  }

  return (
    <div className="ds-stack-lg">
      <CartHeader itemCount={itemCount} />
      <CartItems
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        sidebar={
          <CartSummary items={items} total={total} onCheckout={handleCheckout} />
        }
      />
    </div>
  );
}