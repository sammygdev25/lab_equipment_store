import { Section, Split, Media, Badge, Button } from '../components/ui';
import { Icon } from '../components/icons';
import type { Category } from '../types';

interface CategoryMediaProps {
  category: Category;
  equipmentCount?: number;
  onBrowseEquipment?: () => void;
}

export default function CategoryMedia({ category, equipmentCount, onBrowseEquipment }: CategoryMediaProps) {
  return (
    <Section tight>
      <Split>
        <Media
          src=""
          alt={category.name}
          ratio="wide"
          badge={<Badge tone="primary">{category.name}</Badge>}
        />
        <div className="ds-stack">
          <span className="ds-eyebrow">Equipment category</span>
          <h1 className="ds-card-title">{category.name}</h1>
          <p className="ds-card-meta">
            <Icon name="package" size={16} />
            {typeof equipmentCount === 'number'
              ? `${equipmentCount} item${equipmentCount === 1 ? '' : 's'} in this category`
              : 'Lab-grade instruments and consumables'}
          </p>
          <p className="ds-lead">
            {category.description ||
              `Browse ${category.name.toLowerCase()} sourced and validated for clinical and research labs, ready to ship with full documentation and support.`}
          </p>
          <div className="ds-form-actions">
            <Button variant="primary" size="lg" onClick={onBrowseEquipment}>
              <Icon name="cart" size={18} />
              Shop this category
            </Button>
          </div>
        </div>
      </Split>
    </Section>
  );
}