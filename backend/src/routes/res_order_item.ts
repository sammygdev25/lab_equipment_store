import { Router, Request, Response, RequestHandler } from 'express';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';


// Generated resource router for OrderItem (no domain route file served it).
const router = Router();
const guard: RequestHandler[] = [authMiddleware as unknown as RequestHandler];

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const createSchema = z.object({
  orderId: z.number().int().optional(),
  equipmentId: z.number().int(),
  quantity: z.number().int(),
  priceAtPurchase: z.number(),
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
async function sendList(req: Request, res: Response, where: Prisma.OrderItemWhereInput): Promise<void> {
  const q = listQuery.safeParse(req.query);
  if (!q.success) { res.status(400).json({ error: 'Invalid query', code: 'validation_error', issues: q.error.issues }); return; }
  if (q.data.page === undefined) { res.json(await prisma.orderItem.findMany({ where, orderBy: { id: 'asc' } })); return; }
  const skip = (q.data.page - 1) * q.data.pageSize;
  const [items, total] = await Promise.all([
    prisma.orderItem.findMany({ where, orderBy: { id: 'asc' }, skip, take: q.data.pageSize }),
    prisma.orderItem.count({ where }),
  ]);
  res.json({ items, total, page: q.data.page, pageSize: q.data.pageSize });
}

async function ownedIds(req: Request): Promise<number[]> {
  const userId = (req as Request & { userId?: number }).userId;
  if (userId == null) { return []; }
  const rows = await prisma.order.findMany({ where: { userId }, select: { id: true } });
  return rows.map((r) => r.id);
}

async function writableOrder(req: Request, res: Response, id: unknown): Promise<boolean> {
  const userId = (req as Request & { userId?: number }).userId;
  const row = userId == null || id == null ? null : await prisma.order.findFirst({ where: { id: id as number, userId } });
  if (row === null) { res.status(404).json({ error: 'Order not found' }); return false; }
  if (row.paidAt) { res.status(409).json({ error: 'Order is already paid', code: 'already_paid' }); return false; }
  return true;
}

router.get('/', ...guard, async (req: Request, res: Response) => {
  try {
    const ids = await ownedIds(req);
    await sendList(req, res, { orderId: { in: ids } });
  } catch (err) { logger.warn({ err }, 'OrderItem read failed'); res.status(500).json({ error: 'Server error', code: 'internal_error' }); }
});

router.get('/:id', ...guard, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: 'Invalid id' }); return; }
  try {
    const item = await prisma.orderItem.findUnique({ where: { id } });
    if (!item || !(await ownedIds(req)).includes(item.orderId)) { res.status(404).json({ error: 'OrderItem not found' }); return; }
    res.json(item);
  } catch (err) { logger.warn({ err }, 'OrderItem read failed'); res.status(500).json({ error: 'Server error', code: 'internal_error' }); }
});

router.post('/', ...guard, async (req: Request, res: Response) => {
  const parsed = parseBody(createSchema, res, req.body);
  if (parsed === null) { return; }
  try {
    const data = { ...parsed };
    const userId = (req as Request & { userId?: number }).userId;
    if (data.orderId == null) { res.status(400).json({ error: 'orderId is required', code: 'validation_error' }); return; }
    if ((await writableOrder(req, res, data.orderId)) === false) { return; }
    res.status(201).json(await prisma.orderItem.create({ data: data as Prisma.OrderItemUncheckedCreateInput }));
  } catch (err) { logger.warn({ err }, 'OrderItem write failed'); res.status(400).json({ error: 'Could not save the OrderItem', code: 'write_failed' }); }
});

const update = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: 'Invalid id' }); return; }
  const parsed = parseBody(updateSchema, res, req.body);
  if (parsed === null) { return; }
  try {
    const item = await prisma.orderItem.findUnique({ where: { id } });
    if (!item || !(await ownedIds(req)).includes(item.orderId)) { res.status(404).json({ error: 'OrderItem not found' }); return; }
    const data = { ...parsed } as Record<string, unknown>;
    if ((await writableOrder(req, res, item.orderId)) === false) { return; }
    if (data.orderId != null && data.orderId !== item.orderId && (await writableOrder(req, res, data.orderId)) === false) { return; }
    res.json(await prisma.orderItem.update({ where: { id }, data: data as Prisma.OrderItemUncheckedUpdateInput }));
  } catch (err) { logger.warn({ err }, 'OrderItem write failed'); res.status(400).json({ error: 'Could not save the OrderItem', code: 'write_failed' }); }
};
router.put('/:id', ...guard, update);
router.patch('/:id', ...guard, update);

router.delete('/:id', ...guard, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: 'Invalid id' }); return; }
  try {
    const item = await prisma.orderItem.findUnique({ where: { id } });
    if (!item || !(await ownedIds(req)).includes(item.orderId)) { res.status(404).json({ error: 'OrderItem not found' }); return; }
    if ((await writableOrder(req, res, item.orderId)) === false) { return; }
    await prisma.orderItem.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { logger.warn({ err }, 'OrderItem write failed'); res.status(400).json({ error: 'Could not save the OrderItem', code: 'write_failed' }); }
});

export default router;
