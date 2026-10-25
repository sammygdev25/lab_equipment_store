import { Router, Request, Response, RequestHandler } from 'express';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';


// Generated resource router for CartItem (no domain route file served it).
const router = Router();
const guard: RequestHandler[] = [authMiddleware as unknown as RequestHandler];

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const createSchema = z.object({
  userId: z.number().int().optional(),
  equipmentId: z.number().int(),
  quantity: z.number().int(),
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
async function sendList(req: Request, res: Response, where: Prisma.CartItemWhereInput): Promise<void> {
  const q = listQuery.safeParse(req.query);
  if (!q.success) { res.status(400).json({ error: 'Invalid query', code: 'validation_error', issues: q.error.issues }); return; }
  if (q.data.page === undefined) { res.json(await prisma.cartItem.findMany({ where, orderBy: { id: 'asc' } })); return; }
  const skip = (q.data.page - 1) * q.data.pageSize;
  const [items, total] = await Promise.all([
    prisma.cartItem.findMany({ where, orderBy: { id: 'asc' }, skip, take: q.data.pageSize }),
    prisma.cartItem.count({ where }),
  ]);
  res.json({ items, total, page: q.data.page, pageSize: q.data.pageSize });
}

function ownerOf(req: Request): number | undefined {
  return (req as Request & { userId?: number }).userId;
}

router.get('/', ...guard, async (req: Request, res: Response) => {
  try {
    const userId = ownerOf(req);
    if (userId == null) { res.json([]); return; }
    await sendList(req, res, { userId: userId });
  } catch (err) { logger.warn({ err }, 'CartItem read failed'); res.status(500).json({ error: 'Server error', code: 'internal_error' }); }
});

router.get('/:id', ...guard, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: 'Invalid id' }); return; }
  try {
    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item || item.userId !== ownerOf(req)) { res.status(404).json({ error: 'CartItem not found' }); return; }
    res.json(item);
  } catch (err) { logger.warn({ err }, 'CartItem read failed'); res.status(500).json({ error: 'Server error', code: 'internal_error' }); }
});

router.post('/', ...guard, async (req: Request, res: Response) => {
  const parsed = parseBody(createSchema, res, req.body);
  if (parsed === null) { return; }
  try {
    const data = { ...parsed };
    const userId = (req as Request & { userId?: number }).userId;
    if (userId != null) { data.userId = userId; }
    res.status(201).json(await prisma.cartItem.create({ data: data as Prisma.CartItemUncheckedCreateInput }));
  } catch (err) { logger.warn({ err }, 'CartItem write failed'); res.status(400).json({ error: 'Could not save the CartItem', code: 'write_failed' }); }
});

const update = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: 'Invalid id' }); return; }
  const parsed = parseBody(updateSchema, res, req.body);
  if (parsed === null) { return; }
  try {
    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item || item.userId !== ownerOf(req)) { res.status(404).json({ error: 'CartItem not found' }); return; }
    const data = { ...parsed } as Record<string, unknown>;
    delete data.userId;
    res.json(await prisma.cartItem.update({ where: { id }, data: data as Prisma.CartItemUncheckedUpdateInput }));
  } catch (err) { logger.warn({ err }, 'CartItem write failed'); res.status(400).json({ error: 'Could not save the CartItem', code: 'write_failed' }); }
};
router.put('/:id', ...guard, update);
router.patch('/:id', ...guard, update);

router.delete('/:id', ...guard, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: 'Invalid id' }); return; }
  try {
    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item || item.userId !== ownerOf(req)) { res.status(404).json({ error: 'CartItem not found' }); return; }
    await prisma.cartItem.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { logger.warn({ err }, 'CartItem write failed'); res.status(400).json({ error: 'Could not save the CartItem', code: 'write_failed' }); }
});

export default router;
