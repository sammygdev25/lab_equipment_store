import { Section, Grid, Card, CardBody } from '../components/ui';
import { Icon } from '../components/icons';
import type { Category } from '../types';

interface CategoryFactsProps {
  category: Category;
  equipmentCount?: number;
}

export default function CategoryFacts({ category, equipmentCount }: CategoryFactsProps) {
  const facts = [
    { icon: 'tag' as const, label: 'Category name', value: category.name },
    { icon: 'list' as const, label: 'Slug', value: category.slug },
    {
      icon: 'package' as const,
      label: 'Equipment available',
      value:
        typeof equipmentCount === 'number'
          ? `${equipmentCount} item${equipmentCount === 1 ? '' : 's'}`
          : 'See listing below',
    },
    {
      icon: 'calendar' as const,
      label: 'Added to catalog',
      value: category.createdAt
        ? new Date(category.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'N/A',
    },
  ];

  return (
    <Section eyebrow="Category details" title="What you need to know" tight>
      <Grid cols={2} size="md">
        {facts.map((fact) => (
          <Card key={fact.label}>
            <CardBody>
              <div className="ds-cluster" style={{ alignItems: 'center' }}>
                <Icon name={fact.icon} size={18} />
                <span className="ds-small ds-muted">{fact.label}</span>
              </div>
              <p className="ds-card-title" style={{ marginTop: '0.5rem' }}>
                {fact.value}
              </p>
            </CardBody>
          </Card>
        ))}
      </Grid>
      {category.description && (
        <Card>
          <CardBody>
            <div className="ds-cluster" style={{ alignItems: 'center' }}>
              <Icon name="info" size={18} />
              <span className="ds-small ds-muted">About this category</span>
            </div>
            <p className="ds-lead" style={{ marginTop: '0.5rem' }}>
              {category.description}
            </p>
          </CardBody>
        </Card>
      )}
    </Section>
  );
}