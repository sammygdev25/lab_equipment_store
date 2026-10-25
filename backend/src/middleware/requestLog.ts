import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import pinoHttp from 'pino-http';
import { logger } from '../lib/logger';

const QUIET_PATHS = new Set(['/health/', '/health/ready']);

export const requestLog = pinoHttp({
  logger,
  genReqId: (req: IncomingMessage, res: ServerResponse) => {
    const given = req.headers['x-request-id'];
    const id = typeof given === 'string' && given.length > 0 && given.length <= 128 ? given : randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
  autoLogging: { ignore: (req) => QUIET_PATHS.has((req.url || '').split('?')[0]) },
});
