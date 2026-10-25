import api from '../api';

export async function startCheckout(orderId: number): Promise<{ url: string; sessionId: string }> {
  const res = await api.post('/payments/checkout/', { orderId });
  return res.data as { url: string; sessionId: string };
}

export async function paymentStatus(sessionId: string): Promise<{ orderId: number; paid: boolean }> {
  const res = await api.get('/payments/status/', { params: { session_id: sessionId } });
  return res.data as { orderId: number; paid: boolean };
}

export type PayableOrder = { id: number; amount: number; paid: boolean };

// The pay page's read: one order of the caller, served by the payments router itself.
export async function payableOrder(id: number): Promise<PayableOrder> {
  const res = await api.get('/payments/order/', { params: { order: id } });
  return res.data as PayableOrder;
}

export type UnpaidOrder = { id: number; amount: number };

// The caller's unpaid orders, for the notice above every page (PX.151).
export async function unpaidOrders(): Promise<UnpaidOrder[]> {
  const res = await api.get('/payments/unpaid/');
  return Array.isArray(res.data) ? (res.data as UnpaidOrder[]) : [];
}
