import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../database';
import { AuthRequest } from '../middleware/auth';

// ---------- Validation Schemas ----------

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, alphanumeric and hyphen separated'),
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

const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Invalid id')
    .transform((v) => parseInt(v, 10))
    .refine((v) => v > 0, 'Invalid id'),
});

const slugParamSchema = z.object({
  slug: z.string().min(1).max(120),
});

const equipmentQuerySchema = z.object({
  category: z.string().min(1).optional(),
  search: z.string().min(1).optional(),
});

// ---------- Category Controllers ----------

export async function listCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('[Catalog] Error listing categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export async function getCategoryBySlug(req: Request, res: Response) {
  const parsedParams = slugParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid slug', code: 'validation_error', issues: parsedParams.error.issues });
  }
  try {
    const category = await prisma.category.findFirst({
      where: { slug: parsedParams.data.slug },
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('[Catalog] Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
}

export async function createCategory(req: AuthRequest, res: Response) {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: parsed.data.name }, { slug: parsed.data.slug }],
      },
    });
    if (existing) {
      return res.status(400).json({ error: 'Category with this name or slug already exists' });
    }
    const category = await prisma.category.create({
      data: parsed.data,
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('[Catalog] Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
}

export async function updateCategory(req: AuthRequest, res: Response) {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const category = await prisma.category.findUnique({ where: { id: parsedParams.data.id } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const updated = await prisma.category.update({
      where: { id: parsedParams.data.id },
      data: parsed.data,
    });
    res.json(updated);
  } catch (error) {
    console.error('[Catalog] Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
}

export async function deleteCategory(req: AuthRequest, res: Response) {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  try {
    const category = await prisma.category.findUnique({ where: { id: parsedParams.data.id } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    await prisma.category.delete({ where: { id: parsedParams.data.id } });
    res.status(204).send();
  } catch (error) {
    console.error('[Catalog] Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

// ---------- Equipment Controllers ----------

export async function listEquipment(req: Request, res: Response) {
  const parsedQuery = equipmentQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({ error: 'Invalid query', code: 'validation_error', issues: parsedQuery.error.issues });
  }
  try {
    const { category, search } = parsedQuery.data;
    const where: any = { isActive: true };

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
    console.error('[Catalog] Error listing equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
}

export async function getEquipmentById(req: Request, res: Response) {
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
    console.error('[Catalog] Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
}

export async function createEquipment(req: AuthRequest, res: Response) {
  const parsed = createEquipmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
    if (!category) {
      return res.status(400).json({ error: 'Category does not exist' });
    }
    const existingSku = await prisma.equipment.findFirst({ where: { sku: parsed.data.sku } });
    if (existingSku) {
      return res.status(400).json({ error: 'Equipment with this SKU already exists' });
    }
    const equipment = await prisma.equipment.create({
      data: parsed.data,
      include: { category: true },
    });
    res.status(201).json(equipment);
  } catch (error) {
    console.error('[Catalog] Error creating equipment:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
}

export async function updateEquipment(req: AuthRequest, res: Response) {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  const parsed = updateEquipmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  try {
    const equipment = await prisma.equipment.findUnique({ where: { id: parsedParams.data.id } });
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    if (parsed.data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
      if (!category) {
        return res.status(400).json({ error: 'Category does not exist' });
      }
    }
    const updated = await prisma.equipment.update({
      where: { id: parsedParams.data.id },
      data: parsed.data,
      include: { category: true },
    });
    res.json(updated);
  } catch (error) {
    console.error('[Catalog] Error updating equipment:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
}

export async function deleteEquipment(req: AuthRequest, res: Response) {
  const parsedParams = idParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({ error: 'Invalid id', code: 'validation_error', issues: parsedParams.error.issues });
  }
  try {
    const equipment = await prisma.equipment.findUnique({ where: { id: parsedParams.data.id } });
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    await prisma.equipment.delete({ where: { id: parsedParams.data.id } });
    res.status(204).send();
  } catch (error) {
    console.error('[Catalog] Error deleting equipment:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
}