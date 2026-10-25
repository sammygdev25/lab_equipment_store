import { Response } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { AuthRequest } from '../middleware/auth';

const addItemSchema = z.object({
  equipmentId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
});

const updateQuantitySchema = z.object({
  quantity: z.number().int().positive(),
});

// GET /api/cart/
export async function getCart(req: AuthRequest, res: Response) {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      include: { equipment: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (error) {
    console.error('[Cart] Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
}

// POST /api/cart/
export async function addItem(req: AuthRequest, res: Response) {
  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const equipment = await prisma.equipment.findUnique({ where: { id: parsed.data.equipmentId } });
    if (!equipment || !equipment.isActive) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const existing = await prisma.cartItem.findFirst({
      where: { userId: req.userId, equipmentId: parsed.data.equipmentId },
    });

    const desiredQuantity = existing ? existing.quantity + parsed.data.quantity : parsed.data.quantity;
    if (desiredQuantity > equipment.stockQuantity) {
      return res.status(400).json({ error: 'Requested quantity exceeds available stock' });
    }

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: desiredQuantity },
        include: { equipment: true },
      });
    } else {
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
    console.error('[Cart] Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
}

// PATCH /api/cart/:id
export async function updateQuantity(req: AuthRequest, res: Response) {
  const idParsed = z.coerce.number().int().positive().safeParse(req.params.id);
  if (!idParsed.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error' });
  }
  const parsed = updateQuantitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: idParsed.data, userId: req.userId },
      include: { equipment: true },
    });
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    if (parsed.data.quantity > cartItem.equipment.stockQuantity) {
      return res.status(400).json({ error: 'Requested quantity exceeds available stock' });
    }

    const updated = await prisma.cartItem.update({
      where: { id: idParsed.data },
      data: { quantity: parsed.data.quantity },
      include: { equipment: true },
    });
    res.json(updated);
  } catch (error) {
    console.error('[Cart] Error updating quantity:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
}

// DELETE /api/cart/:id
export async function removeItem(req: AuthRequest, res: Response) {
  const idParsed = z.coerce.number().int().positive().safeParse(req.params.id);
  if (!idParsed.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error' });
  }
  try {
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: idParsed.data, userId: req.userId },
    });
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    await prisma.cartItem.delete({ where: { id: idParsed.data } });
    res.json({ success: true });
  } catch (error) {
    console.error('[Cart] Error removing item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
}

// DELETE /api/cart/
export async function clearCart(req: AuthRequest, res: Response) {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.userId } });
    res.json({ success: true });
  } catch (error) {
    console.error('[Cart] Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
}