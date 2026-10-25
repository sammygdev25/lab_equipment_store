import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { authMiddleware, requireStaff, AuthRequest } from '../middleware/auth';

const router = Router();

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createEquipmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  sku: z.string().min(1),
  price: z.number().nonnegative(),
  stockQuantity: z.number().int().nonnegative().optional().default(0),
  categoryId: z.number().int().positive(),
  imageUrl: z.string().optional().default(''),
  isActive: z.boolean().optional().default(true),
});

const updateEquipmentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  sku: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  categoryId: z.number().int().positive().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/inventory/ - list all equipment for staff inventory management
router.get('/', async (req: Request, res: Response) => {
  try {
    const equipment = await prisma.equipment.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    res.json(equipment);
  } catch (error) {
    console.error('[Inventory] Error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// POST /api/inventory/ - create a new piece of lab equipment (staff only)
router.post('/', authMiddleware, requireStaff, async (req: AuthRequest, res: Response) => {
  const parsed = createEquipmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }
    const item = await prisma.equipment.create({
      data: parsed.data,
      include: { category: true },
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('[Inventory] Error:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
});

// PATCH /api/inventory/:id - update stock, price or details of an equipment item (staff only)
router.patch('/:id', authMiddleware, requireStaff, async (req: AuthRequest, res: Response) => {
  const paramsParsed = idParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: paramsParsed.error.issues });
  }
  const parsed = updateEquipmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const existing = await prisma.equipment.findUnique({ where: { id: paramsParsed.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    if (parsed.data.categoryId !== undefined) {
      const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
      if (!category) {
        return res.status(400).json({ error: 'Category not found' });
      }
    }
    const item = await prisma.equipment.update({
      where: { id: paramsParsed.data.id },
      data: parsed.data,
      include: { category: true },
    });
    res.json(item);
  } catch (error) {
    console.error('[Inventory] Error:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

// DELETE /api/inventory/:id - remove an equipment item from the catalog (staff only)
router.delete('/:id', authMiddleware, requireStaff, async (req: AuthRequest, res: Response) => {
  const paramsParsed = idParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: paramsParsed.error.issues });
  }
  try {
    const existing = await prisma.equipment.findUnique({ where: { id: paramsParsed.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    await prisma.equipment.delete({ where: { id: paramsParsed.data.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('[Inventory] Error:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
});

export default router;