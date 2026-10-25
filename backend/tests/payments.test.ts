import request from 'supertest';
import Stripe from 'stripe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../src/index';
import { onOrderPaid } from '../src/payments/fulfill';

// The real hook, counted: the webhook runs it once per order, not again on the replay.
vi.mock('../src/payments/fulfill', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/payments/fulfill')>();
  return { ...actual, onOrderPaid: vi.fn(actual.onOrderPaid) };
});
import { createTestUser, prisma, resetDatabase, tokenFor } from './setup';

const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
const signer = new Stripe('sk_test_placeholder');
function signed(event: object): { payload: string; header: string } {
  const payload = JSON.stringify(event);
  return { payload, header: signer.webhooks.generateTestHeaderString({ payload, secret }) };
}
function completed(orderId: number, sessionId: string) {
  return { id: `evt_test_${orderId}`, object: 'event', type: 'checkout.session.completed', data: { object: {
    id: sessionId, object: 'checkout.session', payment_status: 'paid', client_reference_id: String(orderId), metadata: { orderId: String(orderId) } } } };
}
const JSON_TYPE = 'application/json';

describe('payments', () => {
  beforeEach(async () => {
    await resetDatabase();
    vi.mocked(onOrderPaid).mockClear();
  });
  it('validates the checkout body and refuses an unknown order', async () => {
    const { user } = await createTestUser();
    const auth = `Bearer ${tokenFor(user.id)}`;
    expect((await request(app).post('/api/payments/checkout/').set('Authorization', auth).send({})).status).toBe(400);
    expect((await request(app).post('/api/payments/checkout/').set('Authorization', auth).send({ orderId: 999999 })).status).toBe(404);
    expect((await request(app).post('/api/payments/checkout/').send({ orderId: 1 })).status).toBe(401);
  });
  it('rejects a webhook without a valid signature', async () => {
    expect((await request(app).post('/api/payments/webhook/').send({})).status).toBe(400);
    const bad = await request(app).post('/api/payments/webhook/').set('stripe-signature', 't=1,v1=bad').set('Content-Type', JSON_TYPE).send('{}');
    expect(bad.status).toBe(400);
  });
  it('serves the pay page one order of the caller only', async () => {
    const { user } = await createTestUser();
    const order = await prisma.order.create({ data: { userId: user.id, totalAmount: 0, status: '', stripePaymentIntentId: '', shippingAddress: '' } });
    await prisma.order.update({ where: { id: order.id }, data: { totalAmount: 13 } });
    const auth = `Bearer ${tokenFor(user.id)}`;
    const mine = await request(app).get(`/api/payments/order/?order=${order.id}`).set('Authorization', auth);
    expect(mine.body).toEqual({ id: order.id, amount: 13, paid: false });
    expect((await request(app).get(`/api/payments/order/?order=${order.id}`)).status).toBe(401);
    expect((await request(app).get('/api/payments/order/?order=999999').set('Authorization', auth)).status).toBe(404);
    const other = await createTestUser({ username: 'other', email: 'other@example.com' });
    const foreign = await request(app).get(`/api/payments/order/?order=${order.id}`).set('Authorization', `Bearer ${tokenFor(other.user.id)}`);
    expect(foreign.status).toBe(404);
  });
  it('marks the order paid once on a signed completed session', async () => {
    const { user } = await createTestUser();
    const order = await prisma.order.create({ data: { userId: user.id, totalAmount: 0, status: '', stripePaymentIntentId: '', shippingAddress: '' } });
    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: 'cs_test_1', totalAmount: 13 } });
    const { payload, header } = signed(completed(order.id, 'cs_test_1'));
    const first = await request(app).post('/api/payments/webhook/').set('stripe-signature', header).set('Content-Type', JSON_TYPE).send(payload);
    expect(first.status).toBe(200);
    const paid = await prisma.order.findUnique({ where: { id: order.id } });
    expect(paid?.paidAt).toBeTruthy();
    const again = await request(app).post('/api/payments/webhook/').set('stripe-signature', header).set('Content-Type', JSON_TYPE).send(payload);
    expect(again.status).toBe(200);
    const later = await prisma.order.findUnique({ where: { id: order.id } });
    expect(later?.paidAt?.getTime()).toBe(paid?.paidAt?.getTime());
    expect(vi.mocked(onOrderPaid)).toHaveBeenCalledTimes(1);
    const auth = `Bearer ${tokenFor(user.id)}`;
    const status = await request(app).get('/api/payments/status/?session_id=cs_test_1').set('Authorization', auth);
    expect(status.body).toEqual({ orderId: order.id, paid: true });
  });
  it('lists only the unpaid orders of the caller', async () => {
    const { user } = await createTestUser();
    const order = await prisma.order.create({ data: { userId: user.id, totalAmount: 0, status: '', stripePaymentIntentId: '', shippingAddress: '' } });
    const auth = `Bearer ${tokenFor(user.id)}`;
    const url = '/api/payments/unpaid/';
    await prisma.order.update({ where: { id: order.id }, data: { totalAmount: 13 } });
    expect((await request(app).get(url).set('Authorization', auth)).body).toEqual([{ id: order.id, amount: 13 }]);
    expect((await request(app).get(url)).status).toBe(401);
    const other = await createTestUser({ username: 'other', email: 'other@example.com' });
    expect((await request(app).get(url).set('Authorization', `Bearer ${tokenFor(other.user.id)}`)).body).toEqual([]);
    await prisma.order.update({ where: { id: order.id }, data: { paidAt: new Date() } });
    expect((await request(app).get(url).set('Authorization', auth)).body).toEqual([]);
  });
});
