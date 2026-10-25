import path from 'node:path';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config';
import prisma from './database';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { apiLimiter, authLimiter } from './middleware/rateLimit';
import { requestLog } from './middleware/requestLog';
import authRoutes from './routes/auth';
import googleRoutes from './auth/google';
import healthRoutes from './routes/health';

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Observability first, then security headers, then CORS with explicit origins from the config.
app.use(requestLog);
app.use(helmet({
  contentSecurityPolicy: config.serveFrontend
    ? { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:', 'https:'], connectSrc: ["'self'"], fontSrc: ["'self'", 'data:'], objectSrc: ["'none'"], frameAncestors: ["'none'"] } }
    : undefined,
}));
app.use(cors({ origin: config.cors.allowAll ? true : config.cors.origins, credentials: true }));
app.use(compression());
app.use(express.json({ limit: config.bodyLimit, verify: (req, _res, buf) => { (req as express.Request & { rawBody?: Buffer }).rawBody = buf; } }));
app.use(express.urlencoded({ extended: false, limit: config.bodyLimit }));

app.use('/health', healthRoutes);
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleRoutes);

// DOMAIN_ROUTES_PLACEHOLDER
// DOMAIN_ROUTES_END

if (config.serveFrontend) {
  const dist = path.resolve(__dirname, '../../frontend/build');
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get(/^(?!\/api\/|\/health).*/, (_req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export function start() {
  const server = app.listen(config.port, () => {
    logger.info({ port: config.port, env: config.nodeEnv }, 'server listening');
  });
  const shutdown = (signal: string) => {
    logger.info({ signal }, 'shutting down');
    server.close(() => {
      prisma.$disconnect().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  return server;
}

if (config.nodeEnv !== 'test') {
  start();
}

export default app;
