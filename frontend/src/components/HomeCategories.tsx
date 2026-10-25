import { Link } from 'react-router-dom';
import { Section, Grid, Card, CardBody, CardTitle, CardMeta } from '../components/ui';
import { Icon } from '../components/icons';
import type { Category } from '../types';

interface HomeCategoriesProps {
  categories: Category[];
}

const CATEGORY_ICONS: Array<'package' | 'shield' | 'award' | 'grid'> = [
  'package',
  'shield',
  'award',
  'grid',
];

export default function HomeCategories({ categories }: HomeCategoriesProps) {
  return (
    <Section
      eyebrow="Browse the catalog"
      title="Browse by category"
      subtitle="From diagnostic analyzers to sterilization equipment, find exactly what your lab needs."
    >
      {categories.length === 0 ? (
        <p className="ds-muted">Categories are being added. Check back soon.</p>
      ) : (
        <Grid size="sm">
          {categories.map((category, idx) => (
            <Card key={category.id} to={`/categories?category=${category.slug}`}>
              <CardBody>
                <Icon
                  name={CATEGORY_ICONS[idx % CATEGORY_ICONS.length]}
                  size={28}
                  title={category.name}
                />
                <CardTitle>{category.name}</CardTitle>
                {category.description && (
                  <CardMeta>{category.description}</CardMeta>
                )}
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}
      <p className="ds-small">
        <Link to="/categories">View the full catalog</Link>
      </p>
    </Section>
  );
}