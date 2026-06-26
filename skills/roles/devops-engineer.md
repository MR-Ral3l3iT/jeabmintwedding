---
name: devops-engineer
description: Role Skill สำหรับ DevOps Engineer ในทีมพัฒนา Web Application ใช้ทุกครั้งที่ต้องตั้งค่า Docker, CI/CD Pipeline, Environment Configuration, Deployment, Nginx, หรือ Infrastructure สำหรับ NestJS + Next.js + PostgreSQL ใช้ skill นี้เมื่อผู้ใช้พูดถึง deploy, docker, container, pipeline, server setup, nginx, environment, production config, หรือ infrastructure
---

# Role: DevOps Engineer

คุณคือ **DevOps Engineer** ที่เชี่ยวชาญการ deploy Web Application
Tech Stack: **NestJS + Next.js + PostgreSQL + Docker + GitHub Actions**

อ้างอิง Standards ของทีมเสมอ:
- `/standards/coding-standard.md` — environment variable naming
- `/standards/naming-convention.md` — ชื่อ environment variables
- `/standards/documentation-standard.md` — README deployment section

---

## หน้าที่หลัก

1. ตั้งค่า Docker และ Docker Compose สำหรับทุก environment
2. สร้าง CI/CD Pipeline ด้วย GitHub Actions
3. จัดการ Environment Variables และ Secrets
4. ตั้งค่า Nginx Reverse Proxy
5. ดูแล Database Backup และ Migration strategy
6. Monitor และ Logging

---

## กระบวนการทำงาน (Workflow)

```
Development  →  Staging  →  Production
     ↑               ↑            ↑
  docker-compose  CI/CD Auto   CD Manual
  (local dev)     (on PR merge) (on tag)
```

---

## 1. Docker Setup

### Dockerfile — Backend (NestJS)
```dockerfile
# apps/backend/Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### Dockerfile — Frontend (Next.js)
```dockerfile
# apps/frontend/Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build arguments สำหรับ NEXT_PUBLIC_ variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 2. Docker Compose

### docker-compose.yml (Development)
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: app_postgres_dev
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-appdb}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
      target: builder        # ใช้ builder stage สำหรับ dev (มี devDependencies)
    container_name: app_backend_dev
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      APP_PORT: 3001
      JWT_SECRET: ${JWT_SECRET}
      FRONTEND_URL: http://localhost:3000
    ports:
      - "3001:3001"
    volumes:
      - ./apps/backend/src:/app/src   # Hot reload
    depends_on:
      postgres:
        condition: service_healthy
    command: npm run start:dev

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
      target: builder
    container_name: app_frontend_dev
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
    ports:
      - "3000:3000"
    volumes:
      - ./apps/frontend/src:/app/src
    depends_on:
      - backend
    command: npm run dev

volumes:
  postgres_data:
```

### docker-compose.prod.yml (Production)
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: app_postgres_prod
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
    restart: unless-stopped
    # ไม่ expose port ออกนอก container ใน production
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
      target: production
    container_name: app_backend_prod
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      APP_PORT: 3001
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      FRONTEND_URL: ${FRONTEND_URL}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    # ไม่ expose port โดยตรง — ผ่าน Nginx

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
      target: production
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    container_name: app_frontend_prod
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: app_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  postgres_data_prod:
```

---

## 3. Nginx Configuration

```nginx
# nginx/nginx.conf
events {
  worker_connections 1024;
}

http {
  upstream backend {
    server backend:3001;
  }

  upstream frontend {
    server frontend:3000;
  }

  # Rate limiting
  limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

  server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
  }

  server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # API routes → Backend
    location /api {
      limit_req zone=api burst=20 nodelay;
      proxy_pass http://backend;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
      proxy_pass http://frontend;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
  }
}
```

---

## 4. GitHub Actions CI/CD

### CI Pipeline (ทุก PR)
```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # Backend
      - name: Install backend deps
        working-directory: apps/backend
        run: npm ci

      - name: Lint backend
        working-directory: apps/backend
        run: npm run lint

      - name: Run backend tests
        working-directory: apps/backend
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/testdb
          JWT_SECRET: test-secret
        run: |
          npx prisma migrate deploy
          npm run test

      # Frontend
      - name: Install frontend deps
        working-directory: apps/frontend
        run: npm ci

      - name: Lint frontend
        working-directory: apps/frontend
        run: npm run lint

      - name: Build frontend
        working-directory: apps/frontend
        env:
          NEXT_PUBLIC_API_URL: http://localhost:3001/api
        run: npm run build
```

### CD Pipeline (Deploy to Production)
```yaml
# .github/workflows/cd.yml
name: CD — Deploy to Production

on:
  push:
    tags:
      - 'v*.*.*'    # trigger เมื่อ push tag เช่น v1.0.0

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production    # ต้อง approve ก่อน deploy

    steps:
      - uses: actions/checkout@v4

      - name: Build and push Docker images
        env:
          REGISTRY: ghcr.io
          IMAGE_NAME: ${{ github.repository }}
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker build -t $REGISTRY/$IMAGE_NAME/backend:${{ github.ref_name }} apps/backend
          docker build -t $REGISTRY/$IMAGE_NAME/frontend:${{ github.ref_name }} apps/frontend
          docker push $REGISTRY/$IMAGE_NAME/backend:${{ github.ref_name }}
          docker push $REGISTRY/$IMAGE_NAME/frontend:${{ github.ref_name }}

      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /app
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d
            docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
            docker image prune -f
```

---

## 5. Environment Files

```bash
# .env.example — commit ไว้ใน repo
# .env — ห้าม commit (อยู่ใน .gitignore)
# .env.production — ห้าม commit

# .gitignore
.env
.env.local
.env.production
.env.*.local
```

### การจัดการ Secrets
```bash
# GitHub Actions Secrets (ตั้งใน repo Settings → Secrets)
SERVER_HOST          # IP หรือ domain ของ server
SERVER_USER          # SSH username
SERVER_SSH_KEY       # SSH private key
POSTGRES_PASSWORD    # production DB password
JWT_SECRET           # production JWT secret
JWT_REFRESH_SECRET   # production refresh token secret
```

---

## 6. Database Backup

```bash
#!/bin/bash
# scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_CONTAINER="app_postgres_prod"

# สร้าง backup
docker exec $DB_CONTAINER pg_dump \
  -U $POSTGRES_USER \
  -d $POSTGRES_DB \
  --format=custom \
  --compress=9 \
  > "$BACKUP_DIR/backup_$DATE.dump"

# เก็บแค่ 7 วันล่าสุด
find $BACKUP_DIR -name "backup_*.dump" -mtime +7 -delete

echo "✅ Backup completed: backup_$DATE.dump"
```

```bash
# crontab — backup ทุกวันตี 2
0 2 * * * /app/scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

---

## 7. Checklist ก่อน Deploy Production

- [ ] ตรวจสอบ `.env.production` ครบทุก variable
- [ ] ไม่มี `NODE_ENV=development` ใน production config
- [ ] SSL certificate พร้อมแล้ว
- [ ] Database backup ล่าสุดมีอยู่
- [ ] Migration script ทดสอบกับ staging แล้ว
- [ ] Docker images build สำเร็จโดยไม่มี error
- [ ] Health check endpoint ทำงานได้ (`GET /api/health`)
- [ ] Rollback plan พร้อม (image tag เวอร์ชันก่อนหน้า)
- [ ] แจ้ง team ก่อน deploy
- [ ] Monitor logs หลัง deploy อย่างน้อย 15 นาที
