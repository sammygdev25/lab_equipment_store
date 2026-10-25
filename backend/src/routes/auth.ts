import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { createHash, randomBytes } from 'node:crypto';
import { config } from '../config';

const router = Router();
const JWT_SECRET = config.jwtSecret;

const passwordRule = z.string().min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password needs a letter').regex(/[0-9]/, 'Password needs a digit');
const registerSchema = z.object({
  username: z.string().min(1).max(150),
  email: z.string().email(),
  password: passwordRule,
  first_name: z.string().max(150).optional(),
  last_name: z.string().max(150).optional(),
});
const loginSchema = z.object({ username: z.string().min(1), password: z.string().min(1) });
const refreshSchema = z.object({ refreshToken: z.string().min(1) });

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

// A short access token and a one-use refresh token stored hashed; the refresh route rotates it.
export async function issueTokens(userId: number): Promise<{ token: string; refreshToken: string }> {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: config.accessTokenTtl as jwt.SignOptions['expiresIn'] });
  const refreshToken = randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { userId, tokenHash: hashToken(refreshToken), expiresAt } });
  return { token, refreshToken };
}

// POST /api/auth/register
router.post('/register/', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Invalid registration';
      return res.status(400).json({ error: message, code: 'validation_error', issues: parsed.error.issues });
    }
    const { username, email, password, first_name, last_name } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName: first_name || '',
        lastName: last_name || '',
      },
    });

    const tokens = await issueTokens(user.id);

    res.status(201).json({
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        is_staff: user.isStaff,
        password_hash: user.passwordHash,
        name: user.name,
        role: user.role,
        google_id: user.googleId,
      },
    });
  } catch (error) {
    console.error('[Auth] Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login/', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Username and password are required', code: 'validation_error' });
    }
    const { username, password } = parsed.data;

    // Support login by email or username
    const user = await prisma.user.findFirst({
      where: username.includes('@')
        ? { email: username }
        : { username: username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = await issueTokens(user.id);

    res.json({
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        is_staff: user.isStaff,
        password_hash: user.passwordHash,
        name: user.name,
        role: user.role,
        google_id: user.googleId,
      },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/refresh: rotate the refresh token and issue a new access token. A used, revoked or expired one is refused.
router.post('/refresh/', async (req: Request, res: Response) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'refreshToken is required', code: 'validation_error' });
  }
  try {
    const row = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(parsed.data.refreshToken) } });
    if (!row || row.revokedAt || row.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    await prisma.refreshToken.update({ where: { id: row.id }, data: { revokedAt: new Date() } });
    res.json(await issueTokens(row.userId));
  } catch (error) {
    console.error('[Auth] Refresh error:', error);
    res.status(500).json({ error: 'Refresh failed' });
  }
});

// POST /api/auth/logout: revoke the given refresh token, or every refresh token of the caller when none is given.
router.post('/logout/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const given = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : '';
    const where = given ? { userId: req.userId, tokenHash: hashToken(given) } : { userId: req.userId };
    await prisma.refreshToken.updateMany({ where: { ...where, revokedAt: null }, data: { revokedAt: new Date() } });
    res.json({ detail: 'Logged out successfully' });
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// GET /api/auth/profile
const profileHandler = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        isStaff: true,
        passwordHash: true,
        name: true,
        role: true,
        googleId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      is_staff: user.isStaff,
      password_hash: user.passwordHash,
      name: user.name,
      role: user.role,
      google_id: user.googleId,
      date_joined: user.createdAt,
    });
  } catch (error) {
    console.error('[Auth] Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
router.get('/profile/', authMiddleware, profileHandler);
router.get('/me/', authMiddleware, profileHandler);

export default router;
