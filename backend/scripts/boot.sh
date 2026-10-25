#!/usr/bin/env sh
# Production boot: migrate, seed the demo data when SEED_DEMO=1 (the seed skips a database that has users),
# start the compiled server. The image carries no tsx, so the seed runs compiled (dist/prisma/seed.js).
set -e
npx prisma migrate deploy
if [ "${SEED_DEMO:-0}" = "1" ]; then
  node dist/prisma/seed.js
fi
exec node dist/index.js
