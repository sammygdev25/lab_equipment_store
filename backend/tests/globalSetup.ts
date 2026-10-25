import { execSync } from 'node:child_process';

// Runs once before the suites: the schema lands in the test database so every suite starts from real tables.
export default function setup() {
  const url = process.env.TEST_DATABASE_URL || 'postgresql://app:app@localhost:5432/app_test';
  const env = { ...process.env, DATABASE_URL: url };
  // Local and preview runs start their own server; where a service answers (CI), the script finds it running.
  try { execSync('bash scripts/local-postgres.sh', { stdio: 'inherit' }); } catch { /* a service may already answer */ }
  execSync('bash scripts/ensure-migration.sh', { stdio: 'inherit' });
  // The test database is reset, never migrated forward: a reused one (a laptop container from an older build) drifts.
  if (!/\/[A-Za-z0-9_]*_test(\?|$)/.test(url)) { throw new Error('TEST_DATABASE_URL must name a *_test database: the setup resets it'); }
  execSync('npx prisma migrate reset --force --skip-generate --skip-seed', { stdio: 'inherit', env });
}
