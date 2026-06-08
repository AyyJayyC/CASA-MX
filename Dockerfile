#
# CasaMX monorepo Dockerfile (Railway production deploy)
# Builds the backend (apps/api) with workspace dependency on @casa-mx/shared
#

FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

RUN npm ci

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"

RUN npm run build:shared
RUN npx prisma generate -w apps/api
RUN npm run build -w apps/api

FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl libssl3 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

RUN npm ci --workspaces --if-present --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy -w apps/api && node apps/api/dist/server.js"]
