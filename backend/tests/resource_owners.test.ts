import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../src/index';
import { createTestUser, prisma, resetDatabase, tokenFor } from './setup';

// Generated with the resource routers (PX.152): a row under a parent is written only by the parent's owner.
describe('resource owners', () => {
  beforeEach(async () => {
    await resetDatabase();
  });
  it('/api/order_items writes only under a parent of the caller', async () => {
    const { user } = await createTestUser();
    const orderRow = await prisma.order.create({ data: { userId: user.id, totalAmount: 0, status: '', stripePaymentIntentId: '', shippingAddress: '' } });
    const categoryRow = await prisma.category.create({ data: { name: '', slug: '', description: '' } });
    const equipmentRow = await prisma.equipment.create({ data: { categoryId: categoryRow.id, name: '', description: '', sku: '', price: 0, stockQuantity: 0, imageUrl: '', isActive: false } });
    const other = await createTestUser({ username: 'other', email: 'other@example.com' });
    const mine = `Bearer ${tokenFor(user.id)}`;
    const theirs = `Bearer ${tokenFor(other.user.id)}`;
    const body = { orderId: orderRow.id, equipmentId: equipmentRow.id, quantity: 1, priceAtPurchase: 1 };
    expect((await request(app).post('/api/order_items/').set('Authorization', theirs).send(body)).status).toBe(404);
    const made = await request(app).post('/api/order_items/').set('Authorization', mine).send(body);
    expect(made.status).toBe(201);
    expect((await request(app).patch(`/api/order_items/${made.body.id}/`).set('Authorization', theirs).send({})).status).toBe(404);
    expect((await request(app).delete(`/api/order_items/${made.body.id}/`).set('Authorization', theirs)).status).toBe(404);
    await prisma.order.update({ where: { id: orderRow.id }, data: { paidAt: new Date() } });
    expect((await request(app).delete(`/api/order_items/${made.body.id}/`).set('Authorization', mine)).status).toBe(409);
  });
});
