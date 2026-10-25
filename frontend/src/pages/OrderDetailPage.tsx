import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrder, getEquipmentList } from '../api';
import { useCart } from '../contexts/CartContext';
import type { Order, Equipment } from '../types';
import OrderDetailMedia from '../components/OrderDetailMedia';
import OrderDetailFacts from '../components/OrderDetailFacts';
import OrderDetailRelated from '../components/OrderDetailRelated';
import { LoadingBlock, Alert } from '../components/ui';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [related, setRelated] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const data = await getOrder(Number(id));
        if (cancelled) return;
        setOrder(data);

        const firstEquipment = data.items?.[0]?.equipment;
        const categoryId = firstEquipment?.categoryId;
        if (categoryId) {
          const allEquipment = await getEquipmentList();
          const orderedIds = new Set(
            (Array.isArray(data.items) ? data.items : []).map((i) => i.equipmentId)
          );
          const candidates = allEquipment
            .filter((eq) => eq.categoryId === categoryId && !orderedIds.has(eq.id))
            .slice(0, 6);
          if (!cancelled) setRelated(candidates);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Failed to load order details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddToCart = async (equipmentId: number) => {
    try {
      await addItem(equipmentId, 1);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingBlock label="Loading order details..." />;
  }

  if (error || !order) {
    return <Alert tone="danger">{error || 'Order not found.'}</Alert>;
  }

  return (
    <div className="ds-stack-lg">
      <OrderDetailMedia order={order} />
      <OrderDetailFacts order={order} />
      {related.length > 0 && (
        <OrderDetailRelated items={related} onAddToCart={handleAddToCart} />
      )}
    </div>
  );
}