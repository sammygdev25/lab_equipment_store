import { PageHeader, Button } from '../components/ui';
import { Icon } from '../components/icons';

interface InventoryManagementHeaderProps {
  itemCount?: number;
  onAddNew?: () => void;
}

export default function InventoryManagementHeader({ itemCount, onAddNew }: InventoryManagementHeaderProps) {
  return (
    <PageHeader
      eyebrow="Sales Staff"
      title="Inventory Management"
      subtitle={
        itemCount !== undefined
          ? `Tracking stock levels, pricing and availability for ${itemCount} lab equipment item${itemCount === 1 ? '' : 's'}.`
          : 'Track stock levels, pricing and availability across the lab equipment catalog.'
      }
      actions={
        onAddNew ? (
          <Button variant="primary" onClick={onAddNew}>
            <Icon name="plus" size={16} />
            Add Equipment
          </Button>
        ) : undefined
      }
    />
  );
}