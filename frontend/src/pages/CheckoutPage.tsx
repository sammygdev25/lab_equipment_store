import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      const res = await api.post<Order>('/orders/', {
        shippingAddress: shippingAddress.trim(),
        items: items.map((item) => ({
          equipmentId: item.equipmentId,
          quantity: item.quantity,
        })),
      });
      const order = res.data;
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
          action={
            <Link to="/categories" className="btn btn-primary">
              Browse equipment
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <Stack gap="lg">
      <CheckoutHeader step="shipping" />
      {error && (
        <div className="ds-alert ds-alert-error" role="alert">
          {error}
        </div>
      )}
      <CheckoutForm
        total={total}
        onSubmit={handleSubmit}
        loading={loading}
        address={shippingAddress}
        onAddressChange={setShippingAddress}
        customerName={user?.name ?? undefined}
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
