import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { config } from '../config';
import { logger } from '../lib/logger';
import { HttpError } from '../lib/httpError';

type Shaped = { name?: string; type?: string; message?: string };

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = res.getHeader('X-Request-Id');
  const log = req.log ?? logger;
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, code: err.code, ...(err.details !== undefined ? { details: err.details } : {}), requestId });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', code: 'validation_error', details: err.flatten().fieldErrors, requestId });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Already exists', code: 'conflict', requestId });
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found', code: 'not_found', requestId });
    log.error({ err, requestId }, 'database request failed');
    return res.status(400).json({ error: 'Database request failed', code: 'database_error', requestId });
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: 'Invalid data', code: 'validation_error', requestId });
  }
  const shaped = (err ?? {}) as Shaped;
  if (shaped.name === 'JsonWebTokenError' || shaped.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'unauthorized', requestId });
  }
  if (shaped.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large', code: 'payload_too_large', requestId });
  if (shaped.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON body', code: 'bad_json', requestId });
  log.error({ err, requestId }, 'unhandled error');
  return res.status(500).json({
    error: 'Internal server error',
    code: 'internal_error',
    requestId,
    ...(config.isProduction ? {} : { detail: shaped.message ?? String(err) }),
  });
}
