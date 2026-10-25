#!/bin/bash
# Development start for previews and local runs. Production runs the image (Dockerfile): migrate deploy, node dist.
set -e
cd /workspace/backend
echo "[start.sh] Local PostgreSQL..."
bash scripts/local-postgres.sh
echo "[start.sh] Installing backend dependencies..."
npm install --legacy-peer-deps 2>/dev/null || npm install
echo "[start.sh] Running Prisma generate..."
npx prisma generate
echo "[start.sh] Migration history..."
bash scripts/ensure-migration.sh
echo "[start.sh] Applying migrations..."
npx prisma migrate deploy
if [ "${SEED_DEMO:-0}" = "1" ]; then
echo "[start.sh] SEED_DEMO=1: seeding demo data (never set this in production)..."
npx tsx prisma/seed.ts 2>/dev/null || echo "[start.sh] Seed skipped (may already exist)"
else
echo "[start.sh] SEED_DEMO is not 1: skipping seed"
fi
echo "[start.sh] Starting backend server..."
(
  while true; do
    node node_modules/.bin/tsx src/index.ts 2>&1 | tee -a /tmp/backend.log
    echo "[start.sh] Backend exited, restarting in 2s..." | tee -a /tmp/backend.log
    sleep 2
  done
) &
cleanup() {
  pkill -f "tsx src/index.ts" 2>/dev/null
  pkill -f "vite" 2>/dev/null
  sleep 1
  pkill -9 -f "tsx src/index.ts" 2>/dev/null
  pkill -9 -f "vite" 2>/dev/null
}
trap cleanup EXIT
echo "[start.sh] Waiting for backend..."
for i in $(seq 1 60); do
  if curl -s http://localhost:8000/health/ > /dev/null 2>&1; then
    echo "[start.sh] Backend ready"
    break
  fi
  sleep 1
done
echo "[start.sh] Installing frontend dependencies..."
cd /workspace/frontend
npm install --legacy-peer-deps 2>/dev/null || npm install
echo "[start.sh] Starting frontend dev server..."
while true; do
  npm run dev -- --host 0.0.0.0 --port 3000 || true
  echo "[start.sh] Frontend exited, restarting in 2s..."
  sleep 2
done
