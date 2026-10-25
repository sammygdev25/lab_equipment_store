import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategoryList, getEquipmentList } from '../api';
import { useCart } from '../contexts/CartContext';
import type { Category, Equipment } from '../types';
import CategoryListHeader from '../components/CategoryListHeader';
import CategoryListFilters from '../components/CategoryListFilters';
import CategoryListGrid from '../components/CategoryListGrid';
import CategoryListPagination from '../components/CategoryListPagination';

const PAGE_SIZE = 9;

export default function CategoryListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);

  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [cats, items] = await Promise.all([getCategoryList(), getEquipmentList()]);
        if (active) {
          setCategories(cats);
          setEquipment(items);
        }
      } catch (err) {
        console.error('Failed to load catalog', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, sort]);

  const handleSelectCategory = useCallback(
    (slug: string) => {
      if (slug) {
        setSearchParams({ category: slug });
      } else {
        setSearchParams({});
      }
    },
    [setSearchParams]
  );

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setSort('name');
    setSearchParams({});
  }, [setSearchParams]);

  const filteredEquipment = useMemo(() => {
    let list = equipment.filter((item) => item.isActive !== false);

    if (selectedCategory) {
      list = list.filter((item) => item.category?.slug === selectedCategory);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.sku?.toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    switch (sort) {
      case 'price_asc':
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price_desc':
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name':
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return sorted;
  }, [equipment, selectedCategory, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredEquipment.length / PAGE_SIZE));
  const pagedEquipment = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredEquipment.slice(start, start + PAGE_SIZE);
  }, [filteredEquipment, page]);

  const handleAddToCart = useCallback(
    async (equipmentId: number) => {
      try {
        await addItem(equipmentId, 1);
      } catch (err) {
        console.error('Failed to add item to cart', err);
      }
    },
    [addItem]
  );

  return (
    <div className="ds-stack-lg">
      <CategoryListHeader resultCount={filteredEquipment.length} loading={loading} />
      <CategoryListFilters
        categories={categories}
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        sort={sort}
        onSortChange={setSort}
      />
      <CategoryListGrid
        equipment={pagedEquipment}
        loading={loading}
        onAddToCart={handleAddToCart}
        onClearFilters={handleClearFilters}
      />
      <CategoryListPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}