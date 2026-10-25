import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const addCartItemSchema = z.object({
  equipmentId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// GET /api/cart/ - list current user's cart items
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      include: { equipment: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (error) {
    console.error('[Cart] Error:', error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

// POST /api/cart/ - add an item to the cart (or increment quantity if already present)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const parsed = addCartItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: parsed.data.equipmentId },
    });
    if (!equipment || !equipment.isActive) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const existing = await prisma.cartItem.findFirst({
      where: { userId: req.userId, equipmentId: parsed.data.equipmentId },
    });

    let item;
    if (existing) {
      const newQuantity = existing.quantity + parsed.data.quantity;
      if (equipment.stockQuantity > 0 && newQuantity > equipment.stockQuantity) {
        return res.status(400).json({ error: 'Requested quantity exceeds available stock' });
      }
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
        include: { equipment: true },
      });
    } else {
      if (equipment.stockQuantity > 0 && parsed.data.quantity > equipment.stockQuantity) {
        return res.status(400).json({ error: 'Requested quantity exceeds available stock' });
      }
      item = await prisma.cartItem.create({
        data: {
          userId: req.userId as number,
          equipmentId: parsed.data.equipmentId,
          quantity: parsed.data.quantity,
        },
        include: { equipment: true },
      });
    }

    res.status(201).json(item);
  } catch (error) {
    console.error('[Cart] Error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// PATCH /api/cart/:id - update quantity of a cart item
router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  const parsedBody = updateCartItemSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsedBody.error.issues });
  }
  try {
    const existing = await prisma.cartItem.findFirst({
      where: { id: parsedParams.data.id, userId: req.userId },
      include: { equipment: true },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    if (existing.equipment.stockQuantity > 0 && parsedBody.data.quantity > existing.equipment.stockQuantity) {
      return res.status(400).json({ error: 'Requested quantity exceeds available stock' });
    }

    const item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: parsedBody.data.quantity },
      include: { equipment: true },
    });
    res.json(item);
  } catch (error) {
    console.error('[Cart] Error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// DELETE /api/cart/:id - remove a single item from the cart
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  try {
    const existing = await prisma.cartItem.findFirst({
      where: { id: parsedParams.data.id, userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    await prisma.cartItem.delete({ where: { id: existing.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('[Cart] Error:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// DELETE /api/cart/ - clear the entire cart for the current user
router.delete('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.userId } });
    res.json({ success: true });
  } catch (error) {
    console.error('[Cart] Error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;