import { Card, CardBody, EmptyState, SkeletonCards, Badge, Button } from '../components/ui';
import { Icon } from '../components/icons';
import type { Equipment } from '../types';

interface InventoryManagementContentProps {
  equipment: Equipment[];
  loading: boolean;
  onEdit: (item: Equipment) => void;
  onDelete: (id: number) => void;
}

export default function InventoryManagementContent({
  equipment,
  loading,
  onEdit,
  onDelete,
}: InventoryManagementContentProps) {
  if (loading) {
    return <SkeletonCards count={6} />;
  }

  if (equipment.length === 0) {
    return (
      <EmptyState
        icon="package"
        title="No lab equipment yet"
        text="Add your first piece of equipment to start tracking stock levels for the catalog."
      />
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => {
                const lowStock = item.stock_quantity <= 5;
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td className="ds-small ds-muted">{item.sku}</td>
                    <td>{item.category?.name ?? '—'}</td>
                    <td>${Number(item.price).toFixed(2)}</td>
                    <td>
                      <Badge tone={lowStock ? 'danger' : 'success'}>
                        {item.stock_quantity} in stock
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={item.is_active ? 'primary' : 'neutral'}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <div className="ds-cluster">
                        <Button
                          variant="ghost"
                          size="md"
                          onClick={() => onEdit(item)}
                          aria-label={`Edit ${item.name}`}
                        >
                          <Icon name="edit" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="md"
                          onClick={() => onDelete(item.id)}
                          aria-label={`Delete ${item.name}`}
                        >
                          <Icon name="trash" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}