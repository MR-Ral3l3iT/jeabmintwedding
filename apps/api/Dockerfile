# Build from repository root:
#   docker build -f apps/api/Dockerfile .

FROM node:20-alpine AS builder
RUN apk add --no-cache openssl openssl-dev libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/prisma/package.json ./packages/prisma/

RUN npm ci

COPY packages/prisma ./packages/prisma
COPY apps/api ./apps/api

RUN npm run prisma:generate
RUN npm run build --workspace=apps/api

FROM node:20-alpine AS production
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/prisma/package.json ./packages/prisma/

RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/main.js"]
