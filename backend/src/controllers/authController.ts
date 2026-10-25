import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../database';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(150),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const googleAuthSchema = z.object({
  idToken: z.string().min(1),
});

function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function sanitizeUser(user: {
  id: number;
  email: string;
  name: string;
  role: string;
  googleId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    googleId: user.googleId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// POST /api/auth/register/
export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  const { email, password, name } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'customer',
      },
    });

    const token = generateToken(user.id);
    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (error) {
    console.error('[Auth] Register error:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
}

// POST /api/auth/login/
export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    res.json({ user: sanitizeUser(user), token });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
}

// POST /api/auth/google/
export async function googleAuth(req: Request, res: Response) {
  const parsed = googleAuthSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', code: 'validation_error', issues: parsed.error.issues });
  }
  const { idToken } = parsed.data;

  try {
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google sign-in is not configured' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || email.split('@')[0];

    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      const existingByEmail = await prisma.user.findUnique({ where: { email } });
      if (existingByEmail) {
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { googleId },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email,
            name,
            role: 'customer',
            googleId,
          },
        });
      }
    }

    const token = generateToken(user.id);
    res.json({ user: sanitizeUser(user), token });
  } catch (error) {
    console.error('[Auth] Google auth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
}