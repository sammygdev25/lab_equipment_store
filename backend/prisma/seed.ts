import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // A seeded database is never seeded twice (the image runs this on every boot with SEED_DEMO=1).
  if ((await prisma.user.count()) > 0 && process.env.SEED_FORCE !== '1') {
    console.log('Seed skipped: the database already has users (SEED_FORCE=1 seeds anyway).');
    return;
  }

  // Create demo user
  // The demo password is this project's own (SEED_DEMO_PASSWORD in backend/.env, made at generation, never shipped):
  // no generated app shares a known password. Without it there are no demo accounts and no demo data.
  const demoPassword = process.env.SEED_DEMO_PASSWORD || '';
  if (!demoPassword) {
    console.warn('[seed] SEED_DEMO_PASSWORD is not set: no demo accounts and no demo data.');
    return;
  }
  const hashedPassword = await bcrypt.hash(demoPassword, 10);
  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@example.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
    },
  });

  // Create demo staff user (staff, the same demo password)
  await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      username: 'staff',
      email: 'staff@example.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'Staff',
      isStaff: true,
    },
  });

  // SEED_DATA_PLACEHOLDER — integration agent inserts domain seed data here

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
