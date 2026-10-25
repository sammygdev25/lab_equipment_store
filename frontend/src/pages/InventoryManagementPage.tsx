import { useState, useEffect, useCallback } from 'react';
import { getEquipmentList, getCategoryList, createEquipment, updateEquipment, deleteEquipment } from '../api';
import type { Equipment, Category } from '../types';
import { Alert } from '../components/ui';
import InventoryManagementHeader from '../components/InventoryManagementHeader';
import InventoryManagementContent from '../components/InventoryManagementContent';
import InventoryItemForm from '../components/InventoryItemForm';

export default function InventoryManagementPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [eq, cats] = await Promise.all([getEquipmentList(), getCategoryList()]);
      setEquipment(eq);
      setCategories(cats);
    } catch (err) {
      console.error(err);
      setError('Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(''), 2000);
    return () => clearTimeout(t);
  }, [feedback]);

  const handleAddNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = async (item: Equipment) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancelForm = async () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleSubmit = async (data: Partial<Equipment>) => {
    setSubmitting(true);
    setError('');
    try {
      if (editingItem) {
        const updated = await updateEquipment(editingItem.id, data);
        setEquipment((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
        setFeedback('Item updated');
      } else {
        const created = await createEquipment(data as Omit<Equipment, 'id'>);
        setEquipment((prev) => [created, ...prev]);
        setFeedback('Item added');
      }
      setShowForm(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      setError('Failed to save item. Please check the form and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError('');
    const previous = equipment;
    setEquipment((prev) => prev.filter((it) => it.id !== id));
    try {
      await deleteEquipment(id);
      setFeedback('Item removed');
    } catch (err) {
      console.error(err);
      setEquipment(previous);
      setError('Failed to delete item. Please try again.');
    }
  };

  return (
    <div className="ds-stack-lg">
      <InventoryManagementHeader itemCount={equipment.length} onAddNew={handleAddNew} />

      {error && <Alert tone="danger">{error}</Alert>}
      {feedback && <Alert tone="success">{feedback}</Alert>}

      {showForm && (
        <InventoryItemForm
          initialData={editingItem ?? {}}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancelForm}
        />
      )}

      <InventoryManagementContent
        equipment={equipment}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
