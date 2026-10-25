import { Section, Grid, Card, CardBody, CardTitle, CardMeta, CardFooter, Price, Badge, Button, SkeletonCards, EmptyState } from '../components/ui';
import { Icon } from '../components/icons';
import type { Equipment } from '../types';

interface HomeFeaturedProps {
  equipment: Equipment[];
  loading?: boolean;
  onAddToCart: (equipment: Equipment) => void;
}

export default function HomeFeatured({ equipment, loading, onAddToCart }: HomeFeaturedProps) {
  return (
    <Section
      eyebrow="Featured equipment"
      title="Top lab instruments this month"
      subtitle="Precision instruments and consumables trusted by clinical and research labs, in stock and ready to ship."
    >
      {loading ? (
        <SkeletonCards count={8} />
      ) : equipment.length === 0 ? (
        <EmptyState
          icon="package"
          title="No equipment available yet"
          text="Check back soon as we stock our catalog with lab equipment."
        />
      ) : (
        <Grid size="md" cols={4}>
          {equipment.slice(0, 8).map((item) => (
            <Card key={item.id} to={`/categories/${item.category?.slug ?? ''}`}>
              <Media src={item.imageUrl} alt={item.name} ratio="square" badge={item.stockQuantity > 0 ? undefined : 'Out of stock'} />
              <CardBody>
                <CardTitle>{item.name}</CardTitle>
                <CardMeta>{item.category?.name ?? 'Lab equipment'}</CardMeta>
                <CardFooter>
                  <Price value={item.price} />
                  {item.stockQuantity > 0 ? (
                    <Badge tone="success">In stock</Badge>
                  ) : (
                    <Badge tone="danger">Out of stock</Badge>
                  )}
                </CardFooter>
                <Button
                  variant="primary"
                  size="md"
                  disabled={item.stockQuantity <= 0}
                  onClick={(e) => {
                    e.preventDefault();
                    onAddToCart(item);
                  }}
                >
                  <Icon name="cart" size={16} /> Add to cart
                </Button>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}
    </Section>
  );
}

function Media({ src, alt, ratio, badge }: { src?: string; alt: string; ratio: 'square' | 'wide' | 'portrait'; badge?: string }) {
  return <MediaImpl src={src} alt={alt} ratio={ratio} badge={badge} />;
}

import { Media as MediaImpl } from '../components/ui';