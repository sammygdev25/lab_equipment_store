import { Section, Grid, Card, CardBody, CardTitle, CardMeta, Price, Media, Button } from '../components/ui';
import { Icon } from '../components/icons';
import type { Equipment } from '../types';

interface CategoryRelatedProps {
  equipment: Equipment[];
  onAddToCart?: (equipmentId: number) => void;
}

export default function CategoryRelated({ equipment, onAddToCart }: CategoryRelatedProps) {
  if (!equipment || equipment.length === 0) {
    return null;
  }

  const items = equipment.slice(0, 6);

  return (
    <Section
      eyebrow="You may also need"
      title="Related equipment"
      subtitle="Other instruments and consumables from this category that labs often order together."
    >
      <Grid size="sm">
        {items.map((item) => (
          <Card key={item.id} to={`/categories/${item.category?.slug ?? ''}`}>
            <Media src={item.imageUrl} alt={item.name} ratio="square" />
            <CardBody>
              <CardTitle>{item.name}</CardTitle>
              <CardMeta>SKU {item.sku}</CardMeta>
              <Price value={item.price} />
              <Button
                variant="secondary"
                size="md"
                disabled={item.stockQuantity <= 0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToCart?.(item.id);
                }}
              >
                <Icon name="cart" size={16} />
                {item.stockQuantity > 0 ? 'Add to cart' : 'Out of stock'}
              </Button>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}