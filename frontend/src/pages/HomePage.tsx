import { useEffect, useState, useCallback } from 'react';
import { getEquipmentList, getCategoryList } from '../api';
import { useCart } from '../contexts/CartContext';
import HomeHero from '../components/HomeHero';
import HomeFeatured from '../components/HomeFeatured';
import HomeCategories from '../components/HomeCategories';
import HomeAbout from '../components/HomeAbout';
import HomeCta from '../components/HomeCta';
import { Alert } from '../components/ui';
import type { Equipment, Category } from '../types';

export default function HomePage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [eq, cats] = await Promise.all([getEquipmentList(), getCategoryList()]);
        if (!active) return;
        setEquipment(eq.filter((e) => e.isActive).slice(0, 8));
        setCategories(cats);
      } catch (err) {
        console.error(err);
        if (active) setError('Failed to load the catalog. Please refresh the page.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleAddToCart = useCallback(
    async (item: Equipment) => {
      try {
        await addItem(item.id, 1);
      } catch (err) {
        console.error(err);
        setError(`Could not add ${item.name} to the cart. Please try again.`);
      }
    },
    [addItem]
  );

  return (
    <div className="ds-stack-lg">
      {error && <Alert tone="danger">{error}</Alert>}
      <HomeHero imageUrl="/img/hero-lab-equipment.jpg" />
      <HomeFeatured equipment={equipment} loading={loading} onAddToCart={handleAddToCart} />
      <HomeCategories categories={categories} />
      <HomeAbout />
      <HomeCta />
    </div>
  );
}