import type { Equipment } from '../types';
import { Button } from './ui';
import { Icon } from './icons';

interface InventoryTableProps {
  equipment: Equipment[];
  onEdit: (item: Equipment) => void;
  onDelete: (item: Equipment) => void;
}

function InventoryTable({ equipment, onEdit, onDelete }: InventoryTableProps) {
  if (equipment.length === 0) {
    return (
      <div className="ds-empty">
        <Icon name="package" size={32} />
        <p>No equipment in inventory yet.</p>
      </div>
    );
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((item) => {
            const lowStock = item.stockQuantity <= 5;
            const outOfStock = item.stockQuantity === 0;
            return (
              <tr key={item.id}>
                <td>
                  <div className="ds-cluster" style={{ alignItems: 'center' }}>
                    <strong>{item.name}</strong>
                  </div>
                </td>
                <td>
                  <span className="ds-small" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                    {item.sku}
                  </span>
                </td>
                <td>{item.category?.name ?? '—'}</td>
                <td>${Number(item.price).toFixed(2)}</td>
                <td>
                  <span
                    style={{
                      color: outOfStock
                        ? 'var(--color-danger)'
                        : lowStock
                        ? 'var(--color-accent)'
                        : 'var(--color-text)',
                      fontWeight: 600,
                    }}
                  >
                    {item.stockQuantity}
                  </span>
                  {lowStock && !outOfStock && (
                    <span className="ds-small" style={{ color: 'var(--color-accent)' }}>
                      {' '}
                      low
                    </span>
                  )}
                  {outOfStock && (
                    <span className="ds-small" style={{ color: 'var(--color-danger)' }}>
                      {' '}
                      out
                    </span>
                  )}
                </td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background: item.isActive ? 'var(--color-success)' : 'var(--color-border)',
                      color: item.isActive ? '#fff' : 'var(--color-text-secondary)',
                    }}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="ds-cluster">
                    <Button variant="ghost" size="md" onClick={() => onEdit(item)} aria-label="Edit item">
                      <Icon name="edit" size={16} />
                    </Button>
                    <Button variant="ghost" size="md" onClick={() => onDelete(item)} aria-label="Delete item">
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
  );
}

export default InventoryTable;
export { InventoryTable };