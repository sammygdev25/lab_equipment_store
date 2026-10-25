import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { authMiddleware, AuthRequest, requireStaff } from '../middleware/auth';

const router = Router();

// ===== Validation schemas =====
const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(120),
  description: z.string().optional().default(''),
});

const updateCategorySchema = createCategorySchema.partial();

const createEquipmentSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional().default(''),
  sku: z.string().min(1).max(50),
  price: z.number().nonnegative(),
  stockQuantity: z.number().int().nonnegative().optional().default(0),
  categoryId: z.number().int().positive(),
  imageUrl: z.string().max(500).optional().default(''),
  isActive: z.boolean().optional().default(true),
});

const updateEquipmentSchema = createEquipmentSchema.partial();

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });
const slugParamSchema = z.object({ slug: z.string().min(1) });

const equipmentQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  includeInactive: z.coerce.boolean().optional(),
});

// ===== Categories =====

// GET /api/categories/
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('[Catalog] Error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/categories/:slug
router.get('/categories/:slug', async (req: Request, res: Response) => {
  const parsedParams = slugParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid slug', code: 'validation_error', issues: parsedParams.error.issues });
  }
  try {
    const category = await prisma.category.findFirst({
      where: { slug: parsedParams.data.slug },
      include: {
        equipments: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('[Catalog] Error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// POST /api/categories/ (staff only)
router.post('/categories', authMiddleware, requireStaff, async (req: AuthRequest, res: Response) => {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const category = await prisma.category.create({ data: parsed.data });
    res.status(201).json(category);
  } catch (error) {
    console.error('[Catalog] Error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/categories/:id (staff only)
router.put('/categories/:id', authMiddleware, requireStaff, async (req: AuthRequest, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const existing = await prisma.category.findUnique({ where: { id: parsedParams.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const category = await prisma.category.update({
      where: { id: parsedParams.data.id },
      data: parsed.data,
    });
    res.json(category);
  } catch (error) {
    console.error('[Catalog] Error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id (staff only)
router.delete('/categories/:id', authMiddleware, requireStaff, async (req: AuthRequest, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  try {
    const existing = await prisma.category.findUnique({ where: { id: parsedParams.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }
    await prisma.category.delete({ where: { id: parsedParams.data.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('[Catalog] Error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ===== Equipment =====

// GET /api/equipment/
router.get('/equipment', async (req: Request, res: Response) => {
  const parsedQuery = equipmentQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({ error: 'Invalid query', code: 'validation_error', issues: parsedQuery.error.issues });
  }
  const { category, search, includeInactive } = parsedQuery.data;
  try {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }
    if (category) {
      where.category = { slug: category };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    const equipment = await prisma.equipment.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    res.json(equipment);
  } catch (error) {
    console.error('[Catalog] Error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// GET /api/equipment/:id
router.get('/equipment/:id', async (req: Request, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: parsedParams.data.id },
      include: { category: true },
    });
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    console.error('[Catalog] Error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// POST /api/equipment/ (staff only)
router.post('/equipment', authMiddleware, requireStaff, async (req: AuthRequest, res: Response) => {
  const parsed = createEquipmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
    if (!category) {
      return res.status(400).json({ error: 'Invalid categoryId' });
    }
    const equipment = await prisma.equipment.create({
      data: parsed.data,
      include: { category: true },
    });
    res.status(201).json(equipment);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    console.error('[Catalog] Error:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
});

// PUT /api/equipment/:id (staff only)
router.put('/equipment/:id', authMiddleware, requireStaff, async (req: AuthRequest, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  const parsed = updateEquipmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const existing = await prisma.equipment.findUnique({ where: { id: parsedParams.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    if (parsed.data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
      if (!category) {
        return res.status(400).json({ error: 'Invalid categoryId' });
      }
    }
    const equipment = await prisma.equipment.update({
      where: { id: parsedParams.data.id },
      data: parsed.data,
      include: { category: true },
    });
    res.json(equipment);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    console.error('[Catalog] Error:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

// PATCH /api/equipment/:id (staff only) — e.g. stock adjustments
router.patch('/equipment/:id', authMiddleware, requireStaff, async (req: AuthRequest, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  const parsed = updateEquipmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const existing = await prisma.equipment.findUnique({ where: { id: parsedParams.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    const equipment = await prisma.equipment.update({
      where: { id: parsedParams.data.id },
      data: parsed.data,
      include: { category: true },
    });
    res.json(equipment);
  } catch (error) {
    console.error('[Catalog] Error:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

// DELETE /api/equipment/:id (staff only)
router.delete('/equipment/:id', authMiddleware, requireStaff, async (req: AuthRequest, res: Response) => {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  try {
    const existing = await prisma.equipment.findUnique({ where: { id: parsedParams.data.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    await prisma.equipment.delete({ where: { id: parsedParams.data.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('[Catalog] Error:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
});

export default router;
