import { Link } from 'react-router-dom';
import type { Equipment } from '../types';
import { Section, Grid, Card, CardBody, CardTitle, CardMeta, CardFooter, Price, Badge, Button, Media, SkeletonCards, EmptyState } from '../components/ui';
import { Icon } from '../components/icons';

interface CategoryListGridProps {
  equipment: Equipment[];
  loading: boolean;
  onAddToCart: (equipmentId: number) => void;
  onClearFilters?: () => void;
}

export default function CategoryListGrid({ equipment, loading, onAddToCart, onClearFilters }: CategoryListGridProps) {
  if (loading) {
    return (
      <Section title="Results" tight>
        <SkeletonCards count={6} />
      </Section>
    );
  }

  if (equipment.length === 0) {
    return (
      <Section title="Results" tight>
        <EmptyState
          icon="package"
          title="No equipment found"
          text="We couldn't find any lab equipment matching your search. Try a different category or clear your filters."
          action={
            onClearFilters ? (
              <Button variant="secondary" onClick={onClearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      </Section>
    );
  }

  return (
    <Section title="Results" tight>
      <Grid size="md" cols={3}>
        {equipment.map((item) => {
          const outOfStock = item.stockQuantity <= 0;
          return (
            <Card key={item.id} to={`/categories/${item.category?.slug ?? ''}`}>
              <Media
                src={item.imageUrl}
                alt={item.name}
                ratio="wide"
                badge={outOfStock ? 'Out of stock' : undefined}
              />
              <CardBody>
                <CardTitle>{item.name}</CardTitle>
                <CardMeta>
                  <span>SKU {item.sku}</span>
                  {item.category?.name && (
                    <Badge tone="soft">{item.category.name}</Badge>
                  )}
                </CardMeta>
                <CardFooter>
                  <Price value={item.price} />
                  <Button
                    variant="primary"
                    disabled={outOfStock}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAddToCart(item.id);
                    }}
                  >
                    <Icon name="cart" size={16} />
                    {outOfStock ? 'Unavailable' : 'Add to cart'}
                  </Button>
                </CardFooter>
              </CardBody>
            </Card>
          );
        })}
      </Grid>
    </Section>
  );
}