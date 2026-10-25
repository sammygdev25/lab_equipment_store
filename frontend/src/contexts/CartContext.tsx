import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getCartItemList, createCartItem, updateCartItem, deleteCartItem } from '../api';
import type { CartItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  addItem: (equipmentId: number, quantity?: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getCartItemList();
      setItems(data);
    } catch (err) {
      console.error('[Cart] Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (equipmentId: number, quantity: number = 1) => {
    try {
      const item = await createCartItem({ equipmentId, quantity } as Omit<CartItem, 'id'>);
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) => (i.id === item.id ? item : i));
        }
        return [item, ...prev];
      });
    } catch (err) {
      console.error('[Cart] Failed to add item:', err);
      throw err;
    }
  }, []);

  const removeItem = useCallback(async (id: number) => {
    try {
      await deleteCartItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('[Cart] Failed to remove item:', err);
      throw err;
    }
  }, []);

  const updateQuantity = useCallback(async (id: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      const updated = await updateCartItem(id, { quantity });
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (err) {
      console.error('[Cart] Failed to update quantity:', err);
      throw err;
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await Promise.all(items.map((i) => deleteCartItem(i.id)));
      setItems([]);
    } catch (err) {
      console.error('[Cart] Failed to clear cart:', err);
      throw err;
    }
  }, [items]);

  const total = items.reduce((sum, i) => sum + (i.equipment?.price ?? 0) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, total, itemCount, loading, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be within CartProvider');
  return ctx;
};
