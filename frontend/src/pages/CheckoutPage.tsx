import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import CheckoutHeader from '../components/CheckoutHeader';
import CheckoutForm from '../components/CheckoutForm';
import CheckoutSummary from '../components/CheckoutSummary';
import { EmptyState, Stack } from '../components/ui';
import type { Order } from '../types';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!shippingAddress.trim()) {
      setError('Please enter a shipping address before placing your order.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const order = await api.post<Order>('/orders/', {
        shippingAddress: shippingAddress.trim(),
        items: items.map((item) => ({
          equipmentId: item.equipmentId,
          quantity: item.quantity,
        })),
      });
      await clearCart();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      console.error('[Checkout] Failed to place order:', err);
      setError('We could not place your order. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="ds-container ds-section">
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          text="Add lab equipment to your cart before checking out."
          action={{ label: 'Browse equipment', to: '/categories' }}
        />
      </div>
    );
  }

  return (
    <Stack gap="lg">
      <CheckoutHeader step="shipping" />
      <CheckoutForm
        total={total}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        address={shippingAddress}
        onAddressChange={setShippingAddress}
        customerName={user?.name}
        sidebar={
          <CheckoutSummary
            items={items}
            total={total}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel={loading ? 'Placing order...' : 'Place order'}
          />
        }
      />
    </Stack>
  );
}