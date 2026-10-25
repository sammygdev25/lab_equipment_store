import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16).optional(),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  CORS_ALLOWED_ORIGINS: z.string().default(''),
  FRONTEND_URL: z.string().default(''),
  CORS_ALLOW_ALL_ORIGINS: z.string().default('0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  BODY_LIMIT: z.string().default('1mb'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  SEED_DEMO: z.string().default('0'),
  SERVE_FRONTEND: z.enum(['auto', '0', '1']).default('auto'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_CURRENCY: z.string().default('usd'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  PUBLIC_URL: z.string().default(''),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // The logger needs the config, so this one message goes to stderr directly.
  console.error('Invalid environment:', JSON.stringify(parsed.error.flatten().fieldErrors));
  process.exit(1);
}
const env = parsed.data;
const isProduction = env.NODE_ENV === 'production';
const jwtSecret = env.JWT_SECRET || (isProduction ? '' : 'shikshya-dev-secret-not-for-production');
if (!jwtSecret) {
  console.error('JWT_SECRET must be set in production (16 characters or more)');
  process.exit(1);
}
const corsOrigins = (env.CORS_ALLOWED_ORIGINS || env.FRONTEND_URL || '').split(',').map((o) => o.trim()).filter(Boolean);

export const config = {
  nodeEnv: env.NODE_ENV,
  isProduction,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  jwtSecret,
  accessTokenTtl: env.ACCESS_TOKEN_TTL,
  refreshTokenTtlDays: env.REFRESH_TOKEN_TTL_DAYS,
  cors: { allowAll: env.CORS_ALLOW_ALL_ORIGINS === '1', origins: corsOrigins },
  logLevel: env.LOG_LEVEL,
  bodyLimit: env.BODY_LIMIT,
  rateLimit: { windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX, authMax: env.AUTH_RATE_LIMIT_MAX },
  seedDemo: env.SEED_DEMO === '1',
  serveFrontend: env.SERVE_FRONTEND === '1' || (env.SERVE_FRONTEND === 'auto' && isProduction),
  frontendUrl: env.FRONTEND_URL,
  stripeSecretKey: env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
  stripeCurrency: env.STRIPE_CURRENCY,
  googleClientId: env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: env.GOOGLE_CLIENT_SECRET || '',
  publicUrl: env.PUBLIC_URL,
} as const;

export type Config = typeof config;
