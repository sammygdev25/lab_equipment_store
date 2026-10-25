#!/usr/bin/env bash
# Start a local PostgreSQL for a preview or a laptop without Docker: data in /tmp/pgdata, socket in /tmp,
# port 5432, trust auth for the app user. Idempotent. Never for production.
set -euo pipefail
PGDATA=${PGDATA:-/tmp/pgdata}
PGPORT=${PGPORT:-5432}
PGBIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -n 1 || true)
if [ -z "$PGBIN" ] && command -v pg_ctl >/dev/null 2>&1; then PGBIN=$(dirname "$(command -v pg_ctl)"); fi
if [ -z "$PGBIN" ]; then echo "[local-postgres] no PostgreSQL binaries found"; exit 1; fi
export PATH="$PGBIN:$PATH"
if pg_isready -h 127.0.0.1 -p "$PGPORT" >/dev/null 2>&1; then echo "[local-postgres] already running"; exit 0; fi
if [ ! -f "$PGDATA/PG_VERSION" ]; then
  initdb -D "$PGDATA" -U app --auth=trust --encoding=UTF8 > /tmp/initdb.log 2>&1
fi
pg_ctl -D "$PGDATA" -l /tmp/postgres.log -o "-p $PGPORT -k /tmp -c listen_addresses=127.0.0.1" -w start
for db in app app_test; do
  if ! psql -h 127.0.0.1 -p "$PGPORT" -U app -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$db'" | grep -q 1; then
    createdb -h 127.0.0.1 -p "$PGPORT" -U app "$db"
  fi
done
echo "[local-postgres] ready on 127.0.0.1:$PGPORT"
