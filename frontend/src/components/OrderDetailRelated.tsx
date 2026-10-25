import { Section, Grid, Card, CardBody, CardTitle, CardMeta, CardFooter, Price, Button, Media } from '../components/ui';
import { Icon } from '../components/icons';
import type { Equipment } from '../types';

interface OrderDetailRelatedProps {
  items: Equipment[];
  onAddToCart?: (equipmentId: number) => void;
}

export default function OrderDetailRelated({ items, onAddToCart }: OrderDetailRelatedProps) {
  if (!items || items.length === 0) return null;

  return (
    <Section
      eyebrow="You may also need"
      title="Related lab equipment"
      subtitle="More instruments and supplies from the same category."
    >
      <Grid size="sm">
        {items.slice(0, 6).map((equipment) => (
          <Card key={equipment.id} to={`/categories/${equipment.category?.slug ?? ''}`}>
            <Media
              src={equipment.imageUrl}
              alt={equipment.name}
              ratio="square"
              badge={equipment.stockQuantity <= 0 ? 'Out of stock' : undefined}
            />
            <CardBody>
              <CardTitle>{equipment.name}</CardTitle>
              <CardMeta>{equipment.category?.name ?? 'Lab equipment'}</CardMeta>
              <CardFooter>
                <Price value={equipment.price} />
                <Button
                  variant="secondary"
                  size="md"
                  disabled={equipment.stockQuantity <= 0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToCart?.(equipment.id);
                  }}
                >
                  <Icon name="cart" size={16} />
                  Add
                </Button>
              </CardFooter>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}