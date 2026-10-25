import { Router } from 'express';
import prisma from '../database';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

router.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', database: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'not_ready', database: 'unreachable' });
  }
});

export default router;
