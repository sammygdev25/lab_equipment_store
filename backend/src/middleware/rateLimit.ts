import rateLimit from 'express-rate-limit';
import { config } from '../config';

const message = { error: 'Too many requests', code: 'rate_limited' };

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message,
});

export const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.authMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message,
});
