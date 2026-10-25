import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { AuthRequest } from '../middleware/auth';
import { createPaymentIntent, constructWebhookEvent } from '../services/stripeService';

const checkoutSchema = z.object({
  shippingAddress: z.string().min(1, 'Shipping address is required'),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// GET /api/orders/
export const listOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { equipment: true },
        },
      },
    });
    res.json(orders);
  } catch (error) {
    console.error('[Orders] Error listing orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req: AuthRequest, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid order id', code: 'validation_error', issues: parsedParams.error.issues });
  }

  try {
    const order = await prisma.order.findFirst({
      where: { id: parsedParams.data.id, userId: req.userId },
      include: {
        items: {
          include: { equipment: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('[Orders] Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// POST /api/checkout/
export const createCheckout = async (req: AuthRequest, res: Response) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      include: { equipment: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    for (const item of cartItems) {
      if (!item.equipment.isActive) {
        return res.status(400).json({ error: `${item.equipment.name} is no longer available` });
      }
      if (item.quantity > item.equipment.stockQuantity) {
        return res.status(400).json({ error: `Insufficient stock for ${item.equipment.name}` });
      }
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.equipment.price) * item.quantity,
      0
    );

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const order = await prisma.order.create({
      data: {
        userId: req.userId!,
        totalAmount,
        status: 'pending',
        shippingAddress: parsed.data.shippingAddress,
        stripePaymentIntentId: 'pending',
        items: {
          create: cartItems.map((item) => ({
            equipmentId: item.equipmentId,
            quantity: item.quantity,
            priceAtPurchase: item.equipment.price,
          })),
        },
      },
      include: {
        items: { include: { equipment: true } },
      },
    });

    const paymentIntent = await createPaymentIntent({
      orderId: order.id,
      amount: totalAmount,
      receiptEmail: user.email,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    await prisma.cartItem.deleteMany({ where: { userId: req.userId } });

    res.status(201).json({
      order: { ...order, stripePaymentIntentId: paymentIntent.id },
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('[Orders] Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

// POST /api/webhooks/stripe/
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string | undefined;

  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  let event;
  try {
    event = constructWebhookEvent(req.body as Buffer, signature);
  } catch (error) {
    console.error('[Orders] Webhook signature verification failed:', error);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as { id: string };

      const order = await prisma.order.findFirst({
        where: { stripePaymentIntentId: session.id },
        include: { items: true },
      });

      if (order && order.status !== 'paid') {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { status: 'paid' },
          });

          for (const item of order.items) {
            await tx.equipment.update({
              where: { id: item.equipmentId },
              data: { stockQuantity: { decrement: item.quantity } },
            });
          }
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[Orders] Error processing webhook event:', error);
    res.status(500).json({ error: 'Failed to process webhook event' });
  }
};
