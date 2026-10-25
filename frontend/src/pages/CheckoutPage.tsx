import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import CheckoutHeader from '../components/CheckoutHeader';
import CheckoutForm from '../components/CheckoutForm';
import { EmptyState, Stack } from '../components/ui';
import type { Order } from '../types';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: { shippingAddress: string; contactName: string; contactEmail: string; contactPhone: string; deliveryMethod: string }) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post<Order>('/orders/', {
        shippingAddress: data.shippingAddress.trim(),
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
      />
    </Stack>
  );
}
