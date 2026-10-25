import { Router, Request, Response, RequestHandler } from 'express';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';
import { requireStaff } from '../middleware/auth';

// Generated resource router for Equipment (no domain route file served it).
const router = Router();
const guard: RequestHandler[] = [authMiddleware as unknown as RequestHandler];
const staff: RequestHandler[] = [authMiddleware as unknown as RequestHandler, requireStaff as unknown as RequestHandler];
function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const createSchema = z.object({
  name: z.string(),
  description: z.string(),
  sku: z.string(),
  price: z.number(),
  stockQuantity: z.number().int(),
  categoryId: z.number().int(),
  imageUrl: z.string(),
  isActive: z.boolean(),
});
const updateSchema = createSchema.partial();
const listQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
function parseBody<S extends z.ZodTypeAny>(schema: S, res: Response, body: unknown): z.output<S> | null {
  const r = schema.safeParse(body);
  if (!r.success) { res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: r.error.issues }); return null; }
  return r.data;
}
async function sendList(req: Request, res: Response, where: Prisma.EquipmentWhereInput): Promise<void> {
  const q = listQuery.safeParse(req.query);
  if (!q.success) { res.status(400).json({ error: 'Invalid query', code: 'validation_error', issues: q.error.issues }); return; }
  if (q.data.page === undefined) { res.json(await prisma.equipment.findMany({ where, orderBy: { id: 'asc' } })); return; }
  const skip = (q.data.page - 1) * q.data.pageSize;
  const [items, total] = await Promise.all([
    prisma.equipment.findMany({ where, orderBy: { id: 'asc' }, skip, take: q.data.pageSize }),
    prisma.equipment.count({ where }),
  ]);
  res.json({ items, total, page: q.data.page, pageSize: q.data.pageSize });
}

router.get('/', async (req: Request, res: Response) => {
  try { await sendList(req, res, {}); } catch (err) { logger.warn({ err }, 'Equipment read failed'); res.status(500).json({ error: 'Server error', code: 'internal_error' }); }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: 'Invalid id' }); return; }
  try {
    const item = await prisma.equipment.findUnique({ where: { id } });
    if (!item) { res.status(404).json({ error: 'Equipment not found' }); return; }
    res.json(item);
  } catch (err) { logger.warn({ err }, 'Equipment read failed'); res.status(500).json({ error: 'Server error', code: 'internal_error' }); }
});

router.post('/', ...staff, async (req: Request, res: Response) => {
  const parsed = parseBody(createSchema, res, req.body);
  if (parsed === null) { return; }
  try {
    const data = { ...parsed };
    res.status(201).json(await prisma.equipment.create({ data: data as Prisma.EquipmentUncheckedCreateInput }));
  } catch (err) { logger.warn({ err }, 'Equipment write failed'); res.status(400).json({ error: 'Could not save the Equipment', code: 'write_failed' }); }
});

const update = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: 'Invalid id' }); return; }
  const parsed = parseBody(updateSchema, res, req.body);
  if (parsed === null) { return; }
  try { res.json(await prisma.equipment.update({ where: { id }, data: parsed as Prisma.EquipmentUncheckedUpdateInput })); } catch (err) { logger.warn({ err }, 'Equipment write failed'); res.status(400).json({ error: 'Could not save the Equipment', code: 'write_failed' }); }
};
router.put('/:id', ...staff, update);
router.patch('/:id', ...staff, update);

router.delete('/:id', ...staff, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: 'Invalid id' }); return; }
  try { await prisma.equipment.delete({ where: { id } }); res.status(204).send(); } catch (err) { logger.warn({ err }, 'Equipment write failed'); res.status(400).json({ error: 'Could not save the Equipment', code: 'write_failed' }); }
});

export default router;
