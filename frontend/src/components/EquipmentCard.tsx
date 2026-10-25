import { Card, CardBody, CardTitle, CardMeta, CardFooter, Price, Media, Badge, Button } from './ui';
import type { Equipment } from '../types';

interface EquipmentCardProps {
  equipment: Equipment;
  onAddToCart: (equipmentId: number, quantity?: number) => void;
}

function EquipmentCard({ equipment, onAddToCart }: EquipmentCardProps) {
  const outOfStock = equipment.stockQuantity <= 0;

  return (
    <Card>
      <Media
        src={equipment.imageUrl}
        alt={equipment.name}
        ratio="square"
        badge={outOfStock ? 'Out of stock' : undefined}
      />
      <CardBody>
        <CardMeta>{equipment.sku}</CardMeta>
        <CardTitle>{equipment.name}</CardTitle>
        {equipment.description && (
          <p className="ds-muted ds-small">{equipment.description}</p>
        )}
        <CardFooter>
          <Price value={equipment.price} />
          {!outOfStock ? (
            <Badge tone="success">In stock: {equipment.stockQuantity}</Badge>
          ) : (
            <Badge tone="danger">Unavailable</Badge>
          )}
        </CardFooter>
        <Button
          variant="primary"
          disabled={outOfStock}
          onClick={() => onAddToCart(equipment.id, 1)}
        >
          Add to cart
        </Button>
      </CardBody>
    </Card>
  );
}

export { EquipmentCard };
export default EquipmentCard;