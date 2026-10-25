import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategoryList, getEquipmentList } from '../api';
import { useCart } from '../contexts/CartContext';
import type { Category, Equipment } from '../types';
import CategoryMedia from '../components/CategoryMedia';
import CategoryFacts from '../components/CategoryFacts';
import CategoryRelated from '../components/CategoryRelated';
import { LoadingBlock, EmptyState, Alert } from '../components/ui';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [category, setCategory] = useState<Category | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const categories = await getCategoryList();
        const found = categories.find((c) => c.slug === slug) || null;
        if (cancelled) return;
        setCategory(found);
        if (found) {
          const allEquipment = await getEquipmentList();
          if (cancelled) return;
          setEquipment(allEquipment.filter((e) => e.categoryId === found.id));
        } else {
          setEquipment([]);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Failed to load this category.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleAddToCart = async (equipmentId: number) => {
    try {
      await addItem(equipmentId, 1);
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToEquipment = () => {
    const el = document.getElementById('category-equipment');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingBlock label="Loading category..." />;
  }

  if (error) {
    return (
      <div className="ds-container ds-section">
        <Alert tone="danger">{error}</Alert>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="ds-container ds-section">
        <EmptyState
          icon="alert"
          title="Category not found"
          text="This equipment category doesn't exist or has been removed."
          action={{ label: 'Browse categories', onClick: () => navigate('/categories') }}
        />
      </div>
    );
  }

  return (
    <div className="ds-stack-lg">
      <CategoryMedia
        category={category}
        equipmentCount={equipment.length}
        onBrowseEquipment={scrollToEquipment}
      />
      <CategoryFacts category={category} equipmentCount={equipment.length} />
      <div id="category-equipment">
        {equipment.length > 0 ? (
          <CategoryRelated equipment={equipment} onAddToCart={handleAddToCart} />
        ) : (
          <div className="ds-container">
            <EmptyState
              icon="package"
              title="No equipment in this category yet"
              text="Check back soon or browse other lab equipment categories."
              action={{ label: 'View all categories', onClick: () => navigate('/categories') }}
            />
          </div>
        )}
      </div>
    </div>
  );
}