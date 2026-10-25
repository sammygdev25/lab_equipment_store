import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const orderItemInputSchema = z.object({
  equipmentId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  shippingAddress: z.string().min(1),
  items: z.array(orderItemInputSchema).min(1),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// GET /api/orders/ - the authenticated customer's order history
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
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
    console.error('[Orders] Error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - a single order belonging to the authenticated customer
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: parsedParams.data.id },
      include: {
        items: {
          include: { equipment: true },
        },
      },
    });

    if (!order || order.userId !== req.userId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('[Orders] Error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders/ - place an order for lab equipment, restocking and clearing the cart
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }

  const { shippingAddress, items } = parsed.data;

  try {
    const equipmentIds = [...new Set(items.map((item) => item.equipmentId))];

    const equipmentRecords = await prisma.equipment.findMany({
      where: { id: { in: equipmentIds }, isActive: true },
    });

    if (equipmentRecords.length !== equipmentIds.length) {
      return res.status(400).json({ error: 'One or more items are unavailable' });
    }

    const equipmentMap = new Map(equipmentRecords.map((e) => [e.id, e]));

    for (const item of items) {
      const equipment = equipmentMap.get(item.equipmentId)!;
      if (equipment.stockQuantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${equipment.name}` });
      }
    }

    const totalAmount = items.reduce((sum, item) => {
      const equipment = equipmentMap.get(item.equipmentId)!;
      return sum + Number(equipment.price) * item.quantity;
    }, 0);

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: req.userId!,
          totalAmount,
          shippingAddress,
          status: 'pending',
          stripePaymentIntentId: '',
          items: {
            create: items.map((item) => {
              const equipment = equipmentMap.get(item.equipmentId)!;
              return {
                equipmentId: item.equipmentId,
                quantity: item.quantity,
                priceAtPurchase: Number(equipment.price),
              };
            }),
          },
        },
        include: {
          items: { include: { equipment: true } },
        },
      });

      for (const item of items) {
        await tx.equipment.update({
          where: { id: item.equipmentId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({
        where: { userId: req.userId!, equipmentId: { in: equipmentIds } },
      });

      return createdOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('[Orders] Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

export default router;
