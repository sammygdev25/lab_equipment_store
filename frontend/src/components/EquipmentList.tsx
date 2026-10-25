import type { Equipment } from '../types';
import { EquipmentCard } from './EquipmentCard';
import { Grid, EmptyState } from './ui';

interface EquipmentListProps {
  equipment: Equipment[];
  onAddToCart: (equipmentId: number) => void;
}

function EquipmentList({ equipment, onAddToCart }: EquipmentListProps) {
  if (!equipment || equipment.length === 0) {
    return (
      <EmptyState
        icon="package"
        title="No equipment found"
        text="No lab equipment matches your current filters. Try a different category or check back later."
      />
    );
  }

  return (
    <Grid size="md" cols={3}>
      {equipment.map((item) => (
        <EquipmentCard key={item.id} equipment={item} onAddToCart={onAddToCart} />
      ))}
    </Grid>
  );
}

export default EquipmentList;
export { EquipmentList };