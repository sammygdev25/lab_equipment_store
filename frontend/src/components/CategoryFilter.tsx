import type { Category } from '../types';
import { Button } from './ui';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="ds-cluster" role="group" aria-label="Filter by category">
      <Button
        type="button"
        size="md"
        variant={selectedCategory === '' ? 'primary' : 'secondary'}
        onClick={() => onSelectCategory('')}
      >
        All equipment
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          type="button"
          size="md"
          variant={selectedCategory === category.slug ? 'primary' : 'secondary'}
          onClick={() => onSelectCategory(category.slug)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}

export default CategoryFilter;
export { CategoryFilter };