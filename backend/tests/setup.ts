import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

export const prisma = new PrismaClient();

export async function resetDatabase() {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma%'
  `;
  for (const { tablename } of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE`);
  }
}

export async function createTestUser(overrides: { username?: string; email?: string; password?: string } = {}) {
  const password = overrides.password || 'testpass123';
  const user = await prisma.user.create({
    data: {
      username: overrides.username || 'testuser',
      email: overrides.email || 'test@example.com',
      password: await bcrypt.hash(password, 10),
      firstName: 'Test',
      lastName: 'User',
    },
  });
  return { user, password };
}

export function tokenFor(userId: number): string {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1h' });
}
