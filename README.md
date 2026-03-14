<!--
  CASA MX - Frontend (Phase 1)
  Purpose: Project bootstrap and architecture for Phase 1.
  UI language: Spanish. Internal comments: English.
-->

# CASA MX — Frontend (Phase 1)

![CI](https://github.com/AyyJayyC/CASA-MX/actions/workflows/main_ci.yml/badge.svg)
![E2E Tests](https://github.com/AyyJayyC/CASA-MX/actions/workflows/e2e.yml/badge.svg)

This repository contains the Phase 1 frontend scaffold for CASA MX.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Daily command reference

```bash
# Unit/integration tests
npm test -- --run

# E2E (auto-starts dev server)
npm run test:e2e:auto

# Production build
npm run build
```

## Tests

Unit tests (Vitest):

```bash
npm run test
```

E2E (Playwright):

- Manual (start dev server yourself):

```bash
npm run dev
npm run test:e2e
```

- Automatic (starts the dev server, waits for it, runs Playwright, then shuts down):

```bash
npm run test:e2e:auto
```

Notes:

- Playwright requires browser binaries — install them once with:

```bash
npx playwright install --with-deps
```

- The `test:e2e:auto` script uses `start-server-and-test` to start the Next dev server and wait for http://localhost:3000 before running tests.
- For CI, use `npm run test:e2e:auto` or add a similar step in your pipeline that starts the app and runs Playwright tests in a dedicated job.

CI: A GitHub Actions workflow is included at `.github/workflows/e2e.yml` which runs the Playwright E2E tests on push and pull requests and uploads the Playwright report as an artifact.

## CI/CD

The project includes GitHub Actions workflows:

- **Unit Tests** (`.github/workflows/unit-tests.yml`) - Fast unit tests run on every PR and push
- **E2E Tests** (`.github/workflows/e2e.yml`) - Playwright E2E tests run on merge to main/master (not on PRs to keep CI fast)
- **A11y checks** - Automated accessibility tests using axe-core run as part of E2E suite

Playwright is configured to retry once in CI (`retries: 1`) to reduce flakiness.

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Analytics Configuration
NEXT_PUBLIC_ANALYTICS_ENABLED=true        # Enable/disable event tracking (default: false)
NEXT_PUBLIC_ANALYTICS_PROVIDER=console    # Provider: console, noop (default: console)
```

**Analytics Providers**:
- `console` - Logs events to browser console (development)
- `noop` - Disabled (no tracking)
- Future: `api` (backend persistence)

## Debug Logging System (Admin)

The app includes a full debug logging system with an admin UI for inspecting user sessions.

### Features

- Client action logging (navigation, button clicks, form submissions)
- Client error logging (React error boundary)
- API request logging (backend middleware)
- Admin session explorer with filters and pagination
- Session detail timeline (actions, errors, API calls)
- Bug report export (JSON download)
- Error resolution with notes

### Admin UI

- Sessions list: /admin/debug
- Session detail: /admin/debug/[sessionId]

### Backend Endpoints (Admin)

- GET /admin/debug/sessions
- GET /admin/debug/sessions/:id
- POST /admin/debug/sessions/:id/export
- PATCH /admin/debug/errors/:id/resolve
- DELETE /admin/debug/cleanup

---

## 🚀 Production Deployment

### Prerequisites

1. **Docker & Docker Compose** installed
2. **Environment Variables** configured
3. **Database** ready (PostgreSQL 15+)
4. **Redis** (optional but recommended for caching)

### Step 1: Environment Validation

Before deploying, validate your environment variables:

```bash
cd casa-mx-backend
npx tsx scripts/check-env.ts
```

This script checks for:
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `JWT_SECRET` - Minimum 32 characters
- ✅ `FRONTEND_URL` - CORS configuration
- ✅ `MAPS_API_KEY` - Google Maps integration
- ⚠️ `REDIS_URL` - Optional (falls back to DB if missing)

**Example .env for Production:**

```bash
# Backend (.env)
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/casamx
REDIS_URL=redis://redis-host:6379
JWT_SECRET=your-super-secure-random-string-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=https://yourdomain.com
MAPS_API_KEY=your-google-maps-api-key
```

### Step 2: Docker Deployment

The project includes a production-optimized Docker Compose configuration with:
- **PostgreSQL 16** with persistent storage
- **Redis 7** with AOF persistence
- **Backend API** with health checks and auto-restart

**Start the production stack:**

```bash
cd casa-mx-backend
docker-compose up -d
```

**Verify services are healthy:**

```bash
docker-compose ps
```

All services should show status `Up (healthy)`.

**View logs:**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f redis
```

### Step 3: Database Migrations

Migrations run automatically on backend startup, but you can run them manually:

```bash
docker-compose exec backend npx prisma migrate deploy
```

**Seed initial data (admin user, roles):**

```bash
docker-compose exec backend npx prisma db seed
```

### Step 4: Verify Redis Caching

Check if Redis is caching location filter data:

1. **View cache logs** in backend:
   ```bash
   docker-compose logs backend | grep CACHE
   ```

2. **Expected output:**
   ```
   [CACHE] Redis connected successfully
   [CACHE] Cache hit for key: location:filter:options
   ```

3. **Check Redis directly:**
   ```bash
   docker-compose exec redis redis-cli
   > KEYS location:filter:*
   > TTL location:filter:options
   ```

4. **Cache invalidation** happens automatically when:
   - New property created (POST /properties)
   - Property updated (PUT /properties/:id)

**Implementation:** See [cache.service.ts](casa-mx-backend/src/services/cache.service.ts)

### Step 5: Access Admin Debug Logs

The production logging system captures all 500-level errors with structured JSON:

1. **View error logs:**
   ```bash
   docker-compose logs backend | grep "PRODUCTION ERROR"
   ```

2. **Log format:**
   ```json
   {
     "timestamp": "2026-02-25T17:30:00.000Z",
     "level": "error",
     "requestId": "req-abc123",
     "method": "GET",
     "url": "/properties/invalid-id",
     "statusCode": 500,
     "message": "Internal server error",
     "stack": "Error: ...",
     "service": "casa-mx-backend"
   }
   ```

3. **Admin debug UI:** Navigate to `/admin/debug` (requires admin role)

**Implementation:** See [app.ts](casa-mx-backend/src/app.ts#L79-L110)

### Step 6: Frontend Deployment

Deploy the Next.js frontend to Vercel, Netlify, or your preferred platform:

```bash
cd casa-mx
npm run build
npm start
```

**Environment variables for frontend:**
- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL (e.g., https://api.yourdomain.com)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key

### Production Monitoring

**Integrate with monitoring services:**

1. **Sentry** (Error tracking):
   ```typescript
   // Uncomment in app.ts error handler
   Sentry.captureException(error, { extra: errorLog });
   ```

2. **LogRocket** (Session replay):
   ```typescript
   // Uncomment in app.ts error handler
   LogRocket.captureException(error, { tags: errorLog });
   ```

3. **Winston** (Structured logging):
   ```typescript
   // Uncomment in app.ts error handler
   logger.error(errorLog);
   ```

### Scaling & Performance

**Redis Caching:**
- Location filters cached for 24 hours
- Reduces database load by ~30-50% for read-heavy workloads
- Gracefully falls back to DB if Redis unavailable

**Connection Pooling:**
- Prisma handles connection pooling automatically
- Adjust `connection_limit` in DATABASE_URL if needed

**Horizontal Scaling:**
- Backend is stateless (JWT-based auth)
- Can run multiple backend instances behind a load balancer
- Redis serves as shared cache layer

### Troubleshooting

**Redis not caching:**
```bash
# Check Redis connection
docker-compose exec redis redis-cli ping
# Should return: PONG

# Check backend logs
docker-compose logs backend | grep "Redis connection"
```

**Database connection errors:**
```bash
# Verify PostgreSQL is healthy
docker-compose exec postgres pg_isready

# Check connection from backend
docker-compose exec backend npx prisma db execute --stdin <<< "SELECT 1"
```

**500 errors not logged:**
- Ensure `NODE_ENV=production` is set
- Check [app.ts](casa-mx-backend/src/app.ts) error handler is active

---

## Data and environment notes

- Frontend uses backend APIs for system-of-record data; localStorage is used for client session/cache behavior.
- Use `NEXT_PUBLIC_API_URL` in `.env.local` to point the frontend at your backend.
- For consolidated project status, validation, and release notes, see:
   - `docs/STATUS_AND_RELEASE_NOTES.md`
   - `docs/VALIDATION_AND_READINESS.md`
   - `docs/POST_RELEASE_ACTIONS.md`
   - `COMPLETE_PROJECT_DOCUMENTATION.md`
