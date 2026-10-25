import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { User, Category, Equipment, CartItem, Order, OrderItem, UserSchema, CategorySchema, EquipmentSchema, CartItemSchema, OrderSchema, OrderItemSchema, PaginatedResponseSchema } from './types';

const API_BASE_URL = '/api';

// Auto-detect K8s preview proxy and rewrite API URLs
const isProxied = window.location.pathname.includes('/preview/proxy');
const proxyBase = isProxied
  ? window.location.pathname.replace(/\/preview\/proxy.*/, '/preview/proxy')
  : '';

const api: AxiosInstance = axios.create({
  baseURL: proxyBase + API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401 with a stored refresh token (the Express track issues one), refresh once and retry.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const refreshToken = localStorage.getItem('refreshToken');
    if (error.response?.status === 401 && refreshToken && original && !original._retried) {
      original._retried = true;
      try {
        const res = await axios.post(proxyBase + API_BASE_URL + '/auth/refresh/', { refreshToken });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        return api(original);
      } catch {
        localStorage.removeItem('refreshToken');
      }
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Response validation is advisory: a schema mismatch must never blank a page.
const parseOr = <S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> => {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn('[api] response did not match schema, using raw data:', result.error.issues.slice(0, 3));
    return data as z.output<S>;
  }
  return result.data;
};

// Auth API
export const login = (credentials: { username: string; password: string }) =>
  api.post('/auth/login/', credentials);
export const register = (data: { username: string; email: string; password: string }) =>
  api.post('/auth/register/', data);
export const logout = () => api.post('/auth/logout/');
export const getProfile = () => api.get('/auth/profile/');

// ── User API ──
export const getUserList = async (params?: Record<string, unknown>): Promise<User[]> => {
  const res = await api.get('/users/', params ? { params } : undefined);
  const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? res.data?.data ?? res.data?.items ?? res.data?.users ?? res.data?.users ?? []);
  // The interface is the strict type: a field name the API does not send is a compile error, not an unknown.
  return parseOr(z.array(UserSchema), data) as User[];
};

export const getUser = async (id: number | string | Record<string, unknown>): Promise<User> => {
  // Pages sometimes call the detail getter with a filter object; route that to the list endpoint.
  if (typeof id === 'object' && id !== null) return getUserList(id) as unknown as Promise<User>;
  const res = await api.get(`/users/${id}/`);
  return parseOr(UserSchema, res.data) as User;
};

export const createUser = async (data: Omit<User, 'id'>): Promise<User> => {
  const res = await api.post('/users/', data);
  return parseOr(UserSchema, res.data) as User;
};

export const updateUser = async (id: number, data: Partial<User>): Promise<User> => {
  const res = await api.patch(`/users/${id}/`, data);
  return parseOr(UserSchema, res.data) as User;
};

export const deleteUser = async (id: number) => {
  await api.delete(`/users/${id}/`);
};

// ── Category API ──
export const getCategoryList = async (params?: Record<string, unknown>): Promise<Category[]> => {
  const res = await api.get('/categories/', params ? { params } : undefined);
  const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? res.data?.data ?? res.data?.items ?? res.data?.categories ?? res.data?.categories ?? []);
  // The interface is the strict type: a field name the API does not send is a compile error, not an unknown.
  return parseOr(z.array(CategorySchema), data) as Category[];
};

export const getCategory = async (id: number | string | Record<string, unknown>): Promise<Category> => {
  // Pages sometimes call the detail getter with a filter object; route that to the list endpoint.
  if (typeof id === 'object' && id !== null) return getCategoryList(id) as unknown as Promise<Category>;
  const res = await api.get(`/categories/${id}/`);
  return parseOr(CategorySchema, res.data) as Category;
};

export const createCategory = async (data: Omit<Category, 'id'>): Promise<Category> => {
  const res = await api.post('/categories/', data);
  return parseOr(CategorySchema, res.data) as Category;
};

export const updateCategory = async (id: number, data: Partial<Category>): Promise<Category> => {
  const res = await api.patch(`/categories/${id}/`, data);
  return parseOr(CategorySchema, res.data) as Category;
};

export const deleteCategory = async (id: number) => {
  await api.delete(`/categories/${id}/`);
};

// ── Equipment API ──
export const getEquipmentList = async (params?: Record<string, unknown>): Promise<Equipment[]> => {
  const res = await api.get('/equipments/', params ? { params } : undefined);
  const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? res.data?.data ?? res.data?.items ?? res.data?.equipments ?? res.data?.equipments ?? []);
  // The interface is the strict type: a field name the API does not send is a compile error, not an unknown.
  return parseOr(z.array(EquipmentSchema), data) as Equipment[];
};

export const getEquipment = async (id: number | string | Record<string, unknown>): Promise<Equipment> => {
  // Pages sometimes call the detail getter with a filter object; route that to the list endpoint.
  if (typeof id === 'object' && id !== null) return getEquipmentList(id) as unknown as Promise<Equipment>;
  const res = await api.get(`/equipments/${id}/`);
  return parseOr(EquipmentSchema, res.data) as Equipment;
};

export const createEquipment = async (data: Omit<Equipment, 'id'>): Promise<Equipment> => {
  const res = await api.post('/equipments/', data);
  return parseOr(EquipmentSchema, res.data) as Equipment;
};

export const updateEquipment = async (id: number, data: Partial<Equipment>): Promise<Equipment> => {
  const res = await api.patch(`/equipments/${id}/`, data);
  return parseOr(EquipmentSchema, res.data) as Equipment;
};

export const deleteEquipment = async (id: number) => {
  await api.delete(`/equipments/${id}/`);
};

// ── CartItem API ──
export const getCartItemList = async (params?: Record<string, unknown>): Promise<CartItem[]> => {
  const res = await api.get('/cart_items/', params ? { params } : undefined);
  const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? res.data?.data ?? res.data?.items ?? res.data?.cart_items ?? res.data?.cartItems ?? []);
  // The interface is the strict type: a field name the API does not send is a compile error, not an unknown.
  return parseOr(z.array(CartItemSchema), data) as CartItem[];
};

export const getCartItem = async (id: number | string | Record<string, unknown>): Promise<CartItem> => {
  // Pages sometimes call the detail getter with a filter object; route that to the list endpoint.
  if (typeof id === 'object' && id !== null) return getCartItemList(id) as unknown as Promise<CartItem>;
  const res = await api.get(`/cart_items/${id}/`);
  return parseOr(CartItemSchema, res.data) as CartItem;
};

export const createCartItem = async (data: Omit<CartItem, 'id'>): Promise<CartItem> => {
  const res = await api.post('/cart_items/', data);
  return parseOr(CartItemSchema, res.data) as CartItem;
};

export const updateCartItem = async (id: number, data: Partial<CartItem>): Promise<CartItem> => {
  const res = await api.patch(`/cart_items/${id}/`, data);
  return parseOr(CartItemSchema, res.data) as CartItem;
};

export const deleteCartItem = async (id: number) => {
  await api.delete(`/cart_items/${id}/`);
};

// ── Order API ──
export const getOrderList = async (params?: Record<string, unknown>): Promise<Order[]> => {
  const res = await api.get('/orders/', params ? { params } : undefined);
  const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? res.data?.data ?? res.data?.items ?? res.data?.orders ?? res.data?.orders ?? []);
  // The interface is the strict type: a field name the API does not send is a compile error, not an unknown.
  return parseOr(z.array(OrderSchema), data) as Order[];
};

export const getOrder = async (id: number | string | Record<string, unknown>): Promise<Order> => {
  // Pages sometimes call the detail getter with a filter object; route that to the list endpoint.
  if (typeof id === 'object' && id !== null) return getOrderList(id) as unknown as Promise<Order>;
  const res = await api.get(`/orders/${id}/`);
  return parseOr(OrderSchema, res.data) as Order;
};

export const createOrder = async (data: Omit<Order, 'id'>): Promise<Order> => {
  const res = await api.post('/orders/', data);
  return parseOr(OrderSchema, res.data) as Order;
};

export const updateOrder = async (id: number, data: Partial<Order>): Promise<Order> => {
  const res = await api.patch(`/orders/${id}/`, data);
  return parseOr(OrderSchema, res.data) as Order;
};

export const deleteOrder = async (id: number) => {
  await api.delete(`/orders/${id}/`);
};

// ── OrderItem API ──
export const getOrderItemList = async (params?: Record<string, unknown>): Promise<OrderItem[]> => {
  const res = await api.get('/order_items/', params ? { params } : undefined);
  const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? res.data?.data ?? res.data?.items ?? res.data?.order_items ?? res.data?.orderItems ?? []);
  // The interface is the strict type: a field name the API does not send is a compile error, not an unknown.
  return parseOr(z.array(OrderItemSchema), data) as OrderItem[];
};

export const getOrderItem = async (id: number | string | Record<string, unknown>): Promise<OrderItem> => {
  // Pages sometimes call the detail getter with a filter object; route that to the list endpoint.
  if (typeof id === 'object' && id !== null) return getOrderItemList(id) as unknown as Promise<OrderItem>;
  const res = await api.get(`/order_items/${id}/`);
  return parseOr(OrderItemSchema, res.data) as OrderItem;
};

export const createOrderItem = async (data: Omit<OrderItem, 'id'>): Promise<OrderItem> => {
  const res = await api.post('/order_items/', data);
  return parseOr(OrderItemSchema, res.data) as OrderItem;
};

export const updateOrderItem = async (id: number, data: Partial<OrderItem>): Promise<OrderItem> => {
  const res = await api.patch(`/order_items/${id}/`, data);
  return parseOr(OrderItemSchema, res.data) as OrderItem;
};

export const deleteOrderItem = async (id: number) => {
  await api.delete(`/order_items/${id}/`);
};


// Auth aliases — domain agents use varied naming conventions
export const loginUser = (email: string, password: string) => api.post('/auth/login/', { username: email, password });
export const registerUser = (userData: any) => api.post('/auth/register/', userData);
export const getCurrentUser = getProfile;
export const updateUserProfile = (data: Partial<any>) => api.patch('/auth/profile/', data);

export default api;
