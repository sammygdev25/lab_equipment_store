import type { Request, Response } from 'express';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: 'Not found', code: 'not_found', path: req.path, requestId: res.getHeader('X-Request-Id') });
}
