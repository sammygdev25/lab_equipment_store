# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS base
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS backend-build
COPY backend/package*.json ./backend/
RUN cd backend && (npm ci --legacy-peer-deps || npm install --legacy-peer-deps)
COPY backend ./backend
RUN cd backend && npm run build

FROM base AS frontend-build
COPY frontend/package*.json ./frontend/
RUN cd frontend && (npm ci --legacy-peer-deps || npm install --legacy-peer-deps)
COPY frontend ./frontend
RUN cd frontend && npm run build

FROM base AS runtime
ENV NODE_ENV=production
RUN groupadd -r app && useradd -r -g app -m -d /home/app app
COPY --from=backend-build /app/backend/package*.json ./backend/
RUN cd backend && (npm ci --omit=dev --legacy-peer-deps || npm install --omit=dev --legacy-peer-deps)
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/prisma ./backend/prisma
COPY --from=backend-build /app/backend/node_modules/.prisma ./backend/node_modules/.prisma
COPY --from=backend-build /app/backend/scripts/boot.sh ./backend/scripts/boot.sh
COPY --from=frontend-build /app/frontend/build ./frontend/build
RUN chown -R app:app /app
USER app
WORKDIR /app/backend
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 8000) + '/health/ready').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["sh", "scripts/boot.sh"]
