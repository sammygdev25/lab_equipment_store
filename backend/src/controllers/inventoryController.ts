import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { AuthRequest } from '../middleware/auth';

// GET /api/inventory/ - list all equipment with stock + category info for staff management
export async function getInventory(req: Request, res: Response) {
  try {
    const equipment = await prisma.equipment.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    res.json(equipment);
  } catch (error) {
    console.error('[Inventory] Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}

const idParamSchema = z.coerce.number().int().positive();

const updateInventorySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  sku: z.string().min(1).max(50).optional(),
  price: z.number().nonnegative().optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  categoryId: z.number().int().positive().optional(),
  imageUrl: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

// PATCH /api/inventory/:id - update stock, price, or other fields of a lab equipment item
export async function updateInventory(req: AuthRequest, res: Response) {
  const idParsed = idParamSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: idParsed.error.issues });
  }

  const parsed = updateInventorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }

  try {
    const existing = await prisma.equipment.findUnique({ where: { id: idParsed.data } });
    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    if (parsed.data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
      if (!category) {
        return res.status(400).json({ error: 'Invalid categoryId', code: 'validation_error' });
      }
    }

    const updated = await prisma.equipment.update({
      where: { id: idParsed.data },
      data: parsed.data,
      include: { category: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('[Inventory] Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
}