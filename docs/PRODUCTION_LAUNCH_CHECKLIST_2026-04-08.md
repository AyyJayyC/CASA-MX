# CASA MX — Production Launch Checklist (2026-04-08)

## Current Go/No-Go Snapshot
- Status: Conditional go with product validation complete; remaining release work is the admin approvals frontend bugfix deploy, production test-data cleanup, and ops evidence.
- Fully revalidated locally on 2026-04-08:
  - Frontend tests: 66/66 passing
  - Backend tests: 230/230 passing
  - Playwright E2E: 33/33 passing
  - Frontend production build: passed
  - Backend production build: passed
  - Backend health endpoint: passed with database and cache healthy
  - Public deployment check on 2026-04-08:
    - `https://casa-mx.com` is reachable
    - `https://api.casa-mx.com/health` is reachable
    - `https://api.casa-mx.com/version` is reachable and reports `environment: production`
    - `https://casa-mx.com/privacy`, `/terms`, and `/cookie` return 200 after the frontend redeploy
    - Public smoke Playwright check passed against `https://casa-mx.com` and `https://api.casa-mx.com`
    - Authenticated publish-flow Playwright check passed against production with an approved seller account

## What Is Already Good Enough To Ship
- Property publish flow is working end to end.
- Docker-backed backend services are healthy locally.
- Frontend and backend production builds succeed.
- Auth, role gating, admin flows, and property workflows are covered by automated tests.
- Google Maps usage is enforced from the backend, not the browser.

## Remaining Launch Gates

### P0: Must Be True Before Production Traffic
- Replace all localhost URLs with real production domains.
- Set backend `NODE_ENV=production`.
- Set backend `FRONTEND_URL` to the exact public frontend origin.
- Set frontend `NEXT_PUBLIC_FRONTEND_URL` to the exact public frontend origin.
- Set frontend `NEXT_PUBLIC_API_URL` to the exact public backend origin.
- Replace backend placeholder `MAPS_API_KEY` with a real server-side Google Maps key.
- Keep backend `ENABLE_BILLABLE_MAPS=true` in production.
- Replace all development/default secrets with production-managed secrets.
- Deploy the frontend admin approvals bugfix so approve/reject actions no longer trigger `400 Bad Request` on the live site.
- Remove or unpublish the production test listing created during authenticated smoke validation.
- Complete monitoring ownership, dashboard links, alert routing, backup evidence, and rollback evidence.

### P1: Must Be Explicitly Decided Before DNS Cutover
- Confirm frontend and backend will be deployed on same-site domains.
- Confirm cookie behavior is acceptable for the chosen topology.
- Confirm live cookie behavior is acceptable for the chosen topology after deployment.

## Production Domain Decision

### Recommended Topology
- Frontend: `https://casa-mx.com`
- Backend: `https://api.casa-mx.com`

This is the safest fit for the current auth implementation because:
- backend auth cookies use `SameSite=Lax`
- backend CORS expects a single configured frontend origin
- frontend requests use `credentials: 'include'`

Using sibling subdomains under the same registrable domain keeps requests same-site for cookie purposes. If frontend and backend are deployed on different sites, cookie-based auth will become brittle and the auth strategy should be revisited before launch.

## Environment Matrix

### Frontend Production Env
- `NEXT_PUBLIC_FRONTEND_URL=https://casa-mx.com`
- `NEXT_PUBLIC_API_URL=https://api.casa-mx.com`
- `NEXT_PUBLIC_MAPS_PROXY=https://api.casa-mx.com`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=`
- `NEXT_PUBLIC_ANALYTICS_ENABLED=true`
- `NEXT_PUBLIC_ANALYTICS_PROVIDER=api`

Notes:
- Leave `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` blank unless you intentionally reintroduce browser-side Maps usage.
- `NEXT_PUBLIC_FRONTEND_URL` is used by metadata generation and Open Graph URLs.

### Backend Production Env
- `NODE_ENV=production`
- `PORT=<platform port>`
- `DATABASE_URL=<managed postgres connection string>`
- `REDIS_URL=<managed redis connection string>`
- `JWT_SECRET=<32+ char secret from secret manager>`
- `JWT_ACCESS_EXPIRY=15m`
- `JWT_REFRESH_EXPIRY=7d`
- `FRONTEND_URL=https://casa-mx.com`
- `MAPS_API_KEY=<real server-side Google Maps key>`
- `ENABLE_BILLABLE_MAPS=true`

Notes:
- Do not ship the placeholder maps key.
- Do not ship default JWT secrets.
- The local Docker compose defaults are suitable for local validation, not production.

## Auth And Session Launch Notes
- Backend login and refresh flows set `httpOnly` cookies with `secure` enabled only in production.
- Frontend auth now relies on `credentials: 'include'` plus cookie-based refresh instead of persisting access or refresh tokens in browser localStorage.
- `/auth/me` supports cookie-first verification when no bearer header is present, which matches the hardened frontend flow.
- The main auth release check was validated successfully against `https://casa-mx.com` and `https://api.casa-mx.com` with a real seller login and property publish.

## Rollout Sequence
1. Provision managed Postgres and Redis.
2. Load production secrets into the hosting platform secret manager.
3. Deploy backend with production env and run `npx prisma migrate deploy`.
4. Optionally run `npx prisma db seed` if production needs seed data.
5. Deploy frontend with production URLs.
6. Verify backend `/health` and `/version` on the production origin.
7. Run the critical Playwright publish-flow smoke test against production or staging-with-production-config.
  - Command from `c:\Users\axelj\casa-mx`:
  - `PLAYWRIGHT_BASE_URL=https://casa-mx.com PLAYWRIGHT_API_URL=https://api.casa-mx.com PLAYWRIGHT_LOGIN_EMAIL=<seller-email> PLAYWRIGHT_LOGIN_PASSWORD=<seller-password> npx playwright test tests/e2e/publish-upload-live.spec.ts`
  - Result on 2026-04-08: **1/1 passed** against production using the approved seller validation account
8. Verify login, property publish, property search, and admin approval flows manually.
9. Confirm alerts, logs, dashboards, and rollback owner are live before announcing availability.

## Production Smoke Checklist
- Frontend home page loads with correct canonical metadata.
- Frontend footer exposes `Privacidad`, `Términos`, and `Cookies` links.
- `/privacy`, `/terms`, and `/cookie` return 200 on the public frontend domain.
- Login sets secure auth cookies successfully.
- Refresh flow works after access token expiry.
- Property publish succeeds with images and enriched rental metadata.
- Property cards and detail pages render services, amenities, and galleries correctly.
- Maps-backed address search works without client-side API key leakage.
- Authenticated seller publish works against production with cookie-based auth.
- `/health` reports database ready and cache status clearly.
- Error logs are reaching the chosen monitoring destination.

## Smoke Command Notes
- `tests/e2e/publish-upload-live.spec.ts` now supports `PLAYWRIGHT_BASE_URL` and `PLAYWRIGHT_API_URL`, so the same spec can target localhost or production.
- The spec also supports `PLAYWRIGHT_LOGIN_EMAIL` and `PLAYWRIGHT_LOGIN_PASSWORD` for production seller credentials.
- Default local behavior remains `http://localhost:3000` for the frontend and `http://localhost:3001` for the backend.

## Recommended Immediate Next Step
- Deploy the frontend admin approvals fix, remove the production smoke-test listing, and close the remaining ops evidence items.