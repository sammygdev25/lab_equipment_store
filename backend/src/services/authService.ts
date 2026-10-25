import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../database';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoogleAuthInput {
  email: string;
  name: string;
  googleId: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

function toAuthUser(user: {
  id: number;
  email: string;
  name: string;
  role: string;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function generateToken(user: { id: number; role: string }): string {
  return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    const err: any = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      role: 'customer',
    },
  });

  const token = generateToken(user);
  return { token, user: toAuthUser(user) };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.passwordHash) {
    const err: any = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    const err: any = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user);
  return { token, user: toAuthUser(user) };
}

export async function staffLogin(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.passwordHash) {
    const err: any = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (user.role !== 'staff') {
    const err: any = new Error('This account does not have sales-staff access');
    err.statusCode = 403;
    throw err;
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    const err: any = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user);
  return { token, user: toAuthUser(user) };
}

export async function googleAuthUser(input: GoogleAuthInput): Promise<AuthResult> {
  let user = await prisma.user.findUnique({ where: { googleId: input.googleId } });

  if (!user) {
    const existingByEmail = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingByEmail) {
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { googleId: input.googleId },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          googleId: input.googleId,
          role: 'customer',
        },
      });
    }
  }

  const token = generateToken(user);
  return { token, user: toAuthUser(user) };
}