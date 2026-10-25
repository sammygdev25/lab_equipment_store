import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../database';
import stripe from '../services/stripeService';

const router = Router();

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// POST /api/webhooks/stripe/
// Stripe sends raw, unparsed bodies to webhook endpoints so the signature can be verified.
// This route expects req.body to be the raw request buffer (configured at the app level
// with express.raw({ type: 'application/json' }) for this specific path).
router.post('/stripe', async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];

  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Missing Stripe signature header' });
  }

  let event: Stripe.Event;

  try {
    const payload = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('[Webhooks] Signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;
        const orderIdRaw = session.metadata?.orderId;
        const orderId = orderIdRaw ? parseInt(orderIdRaw, 10) : null;

        if (orderId && Number.isInteger(orderId)) {
          const order = await prisma.order.findUnique({ where: { id: orderId } });
          if (order) {
            await prisma.order.update({
              where: { id: orderId },
              data: {
                status: 'paid',
                stripePaymentIntentId: paymentIntentId ?? order.stripePaymentIntentId,
              },
            });
          } else {
            console.error(`[Webhooks] Order ${orderId} referenced by session not found`);
          }
        } else if (paymentIntentId) {
          await prisma.order.updateMany({
            where: { stripePaymentIntentId: paymentIntentId },
            data: { status: 'paid' },
          });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.order.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { status: 'paid' },
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.order.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { status: 'failed' },
        });
        break;
      }

      default:
        // Unhandled event types are acknowledged but ignored.
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[Webhooks] Error processing Stripe event:', error);
    res.status(500).json({ error: 'Failed to process webhook event' });
  }
});

export default router;
