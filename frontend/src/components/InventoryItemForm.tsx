import { useState, FormEvent } from 'react';
import { Button } from './ui';
import type { Equipment, Category } from '../types';

export interface InventoryItemFormData {
  name: string;
  description: string;
  sku: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  imageUrl: string;
  isActive: boolean;
}

interface InventoryItemFormProps {
  initialData?: Partial<Equipment>;
  onSubmit: (data: InventoryItemFormData) => void | Promise<void>;
  categories: Category[];
  onCancel?: () => void;
}

function InventoryItemForm({ initialData, onSubmit, categories, onCancel }: InventoryItemFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [sku, setSku] = useState(initialData?.sku ?? '');
  const [price, setPrice] = useState(initialData?.price != null ? String(initialData.price) : '');
  const [stockQuantity, setStockQuantity] = useState(
    initialData?.stockQuantity != null ? String(initialData.stockQuantity) : '0'
  );
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId != null ? String(initialData.categoryId) : categories[0]?.id ? String(categories[0].id) : ''
  );
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const priceNum = Number(price);
    const stockNum = Number(stockQuantity);
    const catId = Number(categoryId);

    if (!name.trim()) {
      setError('Equipment name is required.');
      return;
    }
    if (!sku.trim()) {
      setError('SKU is required.');
      return;
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a valid non-negative number.');
      return;
    }
    if (Number.isNaN(stockNum) || stockNum < 0) {
      setError('Stock quantity must be a valid non-negative number.');
      return;
    }
    if (!catId) {
      setError('Please select a category.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        sku: sku.trim(),
        price: priceNum,
        stockQuantity: stockNum,
        categoryId: catId,
        imageUrl: imageUrl.trim(),
        isActive,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="ds-form" onSubmit={handleSubmit}>
      {error && <div className="ds-alert ds-alert-danger">{error}</div>}

      <div className="ds-form-row">
        <div className="ds-field">
          <label className="ds-label" htmlFor="eq-name">Name</label>
          <input
            id="eq-name"
            className="input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Digital Centrifuge CX-200"
          />
        </div>
        <div className="ds-field">
          <label className="ds-label" htmlFor="eq-sku">SKU</label>
          <input
            id="eq-sku"
            className="input"
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="e.g. LAB-CFG-200"
          />
        </div>
      </div>

      <div className="ds-field">
        <label className="ds-label" htmlFor="eq-description">Description</label>
        <textarea
          id="eq-description"
          className="input"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Specifications, intended use, calibration notes..."
        />
      </div>

      <div className="ds-form-row">
        <div className="ds-field">
          <label className="ds-label" htmlFor="eq-price">Price (USD)</label>
          <input
            id="eq-price"
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="ds-field">
          <label className="ds-label" htmlFor="eq-stock">Stock Quantity</label>
          <input
            id="eq-stock"
            className="input"
            type="number"
            min="0"
            step="1"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
          />
        </div>
      </div>

      <div className="ds-form-row">
        <div className="ds-field">
          <label className="ds-label" htmlFor="eq-category">Category</label>
          <select
            id="eq-category"
            className="input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="ds-field">
          <label className="ds-label" htmlFor="eq-image">Image URL</label>
          <input
            id="eq-image"
            className="input"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="/img/centrifuge-cx200.jpg"
          />
        </div>
      </div>

      <div className="ds-field">
        <label className="ds-label" htmlFor="eq-active">
          <input
            id="eq-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Active (visible to customers)
        </label>
      </div>

      <div className="ds-form-actions">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving...' : initialData?.id ? 'Save Changes' : 'Add Equipment'}
        </Button>
      </div>
    </form>
  );
}

export default InventoryItemForm;
export { InventoryItemForm };