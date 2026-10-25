/**
 * Auto-generated TypeScript types and Zod schemas from ProjectContract.
 * Model interfaces match the Django backend exactly.
 */
import { z } from 'zod';

// DRF returns a related object either as its pk or nested; parse both to the pk
// so the parsed type matches the number typed FK fields on the interfaces.
const zRelation = z.union([z.coerce.number().int(), z.object({ id: z.coerce.number().int() }).passthrough()]).transform((v) => (typeof v === 'number' ? v : v.id));

// ── User ──
export interface User {
  id: number;
  email: string;
  passwordHash: string | null;
  name: string;
  role: string;
  googleId: string | null;
  createdAt: string;
  updatedAt: string;
  cartItems?: CartItem[];
  orders?: Order[];
}

export const UserSchema = z.object({
  id: z.coerce.number(),
  email: z.string().email(),
  passwordHash: z.string().nullable(),
  name: z.string(),
  role: z.string(),
  googleId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).passthrough();

// ── Category ──
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  equipments?: Equipment[];
}

export const CategorySchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).passthrough();

// ── Equipment ──
export interface Equipment {
  id: number;
  name: string;
  description: string;
  sku: string;
  price: number;
  stockQuantity: number;
  category?: Category;
  categoryId: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  cartItems?: CartItem[];
  orderItems?: OrderItem[];
}

export const EquipmentSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  description: z.string(),
  sku: z.string(),
  price: z.coerce.number(),
  stockQuantity: z.coerce.number().int(),
  category: z.custom<Category>((v) => typeof v === 'object' && v !== null).optional(),
  categoryId: z.coerce.number().int(),
  imageUrl: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).passthrough();

// ── CartItem ──
export interface CartItem {
  id: number;
  user?: User;
  userId: number;
  equipment?: Equipment;
  equipmentId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export const CartItemSchema = z.object({
  id: z.coerce.number(),
  user: z.custom<User>((v) => typeof v === 'object' && v !== null).optional(),
  userId: z.coerce.number().int(),
  equipment: z.custom<Equipment>((v) => typeof v === 'object' && v !== null).optional(),
  equipmentId: z.coerce.number().int(),
  quantity: z.coerce.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).passthrough();

// ── Order ──
export interface Order {
  id: number;
  user?: User;
  userId: number;
  totalAmount: number;
  status: string;
  stripePaymentIntentId: string | null;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export const OrderSchema = z.object({
  id: z.coerce.number(),
  user: z.custom<User>((v) => typeof v === 'object' && v !== null).optional(),
  userId: z.coerce.number().int(),
  totalAmount: z.coerce.number(),
  status: z.string(),
  stripePaymentIntentId: z.string().nullable(),
  shippingAddress: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).passthrough();

// ── OrderItem ──
export interface OrderItem {
  id: number;
  order?: Order;
  orderId: number;
  equipment?: Equipment;
  equipmentId: number;
  quantity: number;
  priceAtPurchase: number;
  createdAt: string;
  updatedAt: string;
}

export const OrderItemSchema = z.object({
  id: z.coerce.number(),
  order: z.custom<Order>((v) => typeof v === 'object' && v !== null).optional(),
  orderId: z.coerce.number().int(),
  equipment: z.custom<Equipment>((v) => typeof v === 'object' && v !== null).optional(),
  equipmentId: z.coerce.number().int(),
  quantity: z.coerce.number().int(),
  priceAtPurchase: z.coerce.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).passthrough();

// ── Paginated Response ──
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    count: z.coerce.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(itemSchema),
  });

