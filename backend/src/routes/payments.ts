import { Router, Request, Response } from 'express';
import type Stripe from 'stripe';
import { z } from 'zod';
import prisma from '../database';
import { config } from '../config';
import { stripe } from '../lib/stripe';
import { logger } from '../lib/logger';
import { onOrderPaid } from '../payments/fulfill';
import { authMiddleware, AuthRequest } from '../middleware/auth';

// payment model: Order (amount: totalAmount)
const router = Router();
const checkoutSchema = z.object({ orderId: z.number().int().positive() });
const statusQuery = z.object({ session_id: z.string().min(1) });
const orderQuery = z.object({ order: z.coerce.number().int().positive() });

// Where Stripe sends the browser back: the request's origin when CORS allows it, else the configured frontend, else this host.
function siteOrigin(req: Request): string {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
  if (origin && (config.cors.allowAll || config.cors.origins.includes(origin))) return origin;
  if (config.frontendUrl) return config.frontendUrl.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

// POST /api/payments/checkout/: a hosted Stripe Checkout Session for one order of the caller.
router.post('/checkout/', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!stripe) { res.status(503).json({ error: 'Payments are not set up yet', code: 'payments_unavailable' }); return; }
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'orderId is required', code: 'validation_error', issues: parsed.error.issues }); return; }
  try {
    const order = await prisma.order.findFirst({ where: { id: parsed.data.orderId, userId: req.userId } });
    if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
    if (order.paidAt) { res.status(409).json({ error: 'Already paid', code: 'already_paid' }); return; }
    const amount = Math.round(Number(order.totalAmount) * 100);
    if (!Number.isFinite(amount) || amount < 50) { res.status(400).json({ error: 'Amount too small to charge', code: 'amount_too_small' }); return; }
    const origin = siteOrigin(req);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ quantity: 1, price_data: { currency: config.stripeCurrency, unit_amount: amount, product_data: { name: `Order #${order.id}` } } }],
      client_reference_id: String(order.id),
      metadata: { orderId: String(order.id) },
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-cancel?order=${order.id}`,
    });
    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    logger.info({ orderId: order.id, sessionId: session.id }, 'checkout session created');
    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    logger.error({ err: error }, 'checkout failed');
    res.status(502).json({ error: 'Could not start the payment', code: 'checkout_failed' });
  }
});

// POST /api/payments/webhook/: Stripe calls this. The signature on the raw body is checked first; only a paid
// session marks its order paid, once (a replayed event finds paidAt set and changes nothing).
router.post('/webhook/', async (req: Request, res: Response) => {
  if (!stripe || !config.stripeWebhookSecret) { res.status(503).json({ error: 'Webhook is not set up yet', code: 'payments_unavailable' }); return; }
  const signature = req.headers['stripe-signature'];
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (typeof signature !== 'string' || !rawBody) { res.status(400).json({ error: 'Missing signature', code: 'bad_signature' }); return; }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret);
  } catch (error) {
    logger.warn({ err: error }, 'webhook signature rejected');
    res.status(400).json({ error: 'Invalid signature', code: 'bad_signature' }); return;
  }
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = Number(session.metadata?.orderId ?? session.client_reference_id);
    if (session.payment_status === 'paid' && Number.isInteger(orderId) && orderId > 0) {
      try {
        // One transaction: the paid mark and the app's effect stand or fall together, so a failed effect leaves the
        // order unpaid and Stripe's retry runs both again; a replay finds paidAt set and changes nothing.
        const marked = await prisma.$transaction(async (tx) => {
          const m = await tx.order.updateMany({
            where: { id: orderId, stripeSessionId: session.id, paidAt: null },
            data: { paidAt: new Date(), status: 'paid' },
          });
          if (m.count === 1) { await onOrderPaid(await tx.order.findUniqueOrThrow({ where: { id: orderId } }), tx); }
          return m.count;
        });
        logger.info({ orderId, eventId: event.id, marked }, 'checkout completed');
      } catch (error) {
        logger.error({ err: error, orderId, eventId: event.id }, 'fulfillment failed');
        res.status(500).json({ error: 'Fulfillment failed', code: 'fulfillment_failed' }); return;
      }
    }
  }
  res.json({ received: true });
});

// GET /api/payments/order/?order=<id>: the pay page reads one order of the caller (amount and paid flag only), so
// the pay path never depends on a detail route the domain code may not serve (restaurant_order_reserve_7635, 2026-10-15).
router.get('/order/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const q = orderQuery.safeParse(req.query);
  if (!q.success) { res.status(400).json({ error: 'order is required', code: 'validation_error' }); return; }
  try {
    const order = await prisma.order.findFirst({ where: { id: q.data.order, userId: req.userId } });
    if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
    res.json({ id: order.id, amount: Number(order.totalAmount), paid: Boolean(order.paidAt) });
  } catch (error) {
    logger.error({ err: error }, 'payable order lookup failed');
    res.status(500).json({ error: 'Order lookup failed' });
  }
});

// GET /api/payments/status/?session_id=...: the success page asks whether the webhook has marked the order paid.
router.get('/status/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const q = statusQuery.safeParse(req.query);
  if (!q.success) { res.status(400).json({ error: 'session_id is required', code: 'validation_error' }); return; }
  try {
    const order = await prisma.order.findFirst({ where: { stripeSessionId: q.data.session_id, userId: req.userId } });
    if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
    res.json({ orderId: order.id, paid: Boolean(order.paidAt) });
  } catch (error) {
    logger.error({ err: error }, 'payment status failed');
    res.status(500).json({ error: 'Status lookup failed' });
  }
});

// GET /api/payments/unpaid/: the caller's orders not yet paid (no paidAt), newest first, for the notice every
// page shows (PX.151; seeded orders are seeded paid, so a demo login is not nagged).
router.get('/unpaid/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const rows = await prisma.order.findMany({
      where: { paidAt: null, userId: req.userId },
      orderBy: { id: 'desc' },
      take: 5,
    });
    res.json(rows.map((o) => ({ id: o.id, amount: Number(o.totalAmount) })));
  } catch (error) {
    logger.error({ err: error }, 'unpaid lookup failed');
    res.status(500).json({ error: 'Unpaid lookup failed' });
  }
});

export default router;
