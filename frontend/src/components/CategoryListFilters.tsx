import type { Category } from '../types';
import { Section } from '../components/ui';
import { Icon } from '../components/icons';

interface CategoryListFiltersProps {
  categories: Category[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
}

export default function CategoryListFilters({
  categories,
  search,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  sort,
  onSortChange,
}: CategoryListFiltersProps) {
  return (
    <Section tight>
      <div className="ds-filters">
        <div className="ds-field">
          <label className="ds-label" htmlFor="equipment-search">
            Search
          </label>
          <div className="ds-cluster" style={{ alignItems: 'center' }}>
            <Icon name="search" size={16} title="Search" />
            <input
              id="equipment-search"
              className="input"
              type="text"
              placeholder="Search autoclaves, centrifuges, microscopes..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor="category-select">
            Category
          </label>
          <select
            id="category-select"
            className="input"
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor="sort-select">
            Sort by
          </label>
          <select
            id="sort-select"
            className="input"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="name">Name (A-Z)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock">Stock available</option>
          </select>
        </div>
      </div>
    </Section>
  );
}