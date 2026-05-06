# Backend Setup

## Document Control
- Owner:
- Last Updated:
- Status: draft / in-progress / approved

## Runtime
- Node version:
- Package manager:
- Start command:
- Build command:
- Service manager (systemd/pm2/container):

## Required Environment Variables
- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_ACCESS_EXPIRY`
- `JWT_REFRESH_EXPIRY`
- `FRONTEND_URL`
- `MAPS_API_KEY`
- `ENABLE_BILLABLE_MAPS`
- `REDIS_URL` (optional but recommended)

## Health & Readiness
- Health endpoint:
- Version endpoint:
- DB readiness check:
- Redis readiness check:

## Database
- PostgreSQL version:
- Connection pool size:
- Migration command:
- Seed command:

## Cache (Redis)
- Redis URL:
- Persistence mode:
- Memory limit:
- Eviction policy:

## Security Baseline
- CORS allowed origins:
- Helmet headers enabled:
- Rate limit defaults:
- Auth route rate limits:

## Startup / Recovery
- Graceful shutdown implemented: yes/no
- Auto-restart on crash: yes/no
- Crash diagnostics location:

## Smoke Test Commands
```bash
# health
curl http://localhost:3001/health

# properties
curl http://localhost:3001/properties

# maps autocomplete
curl "http://localhost:3001/maps/autocomplete?input=roma"
```

## Go-Live Checks
- [ ] Backend build passes
- [ ] Env vars validated in production
- [ ] Migrations up to date
- [ ] Health/readiness checks pass
- [ ] Auth/login smoke test passes
- [ ] Logs and alerts visible
