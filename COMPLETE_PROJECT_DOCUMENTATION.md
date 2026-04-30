# Casa-MX.com Complete Project Documentation

Last updated: April 29, 2026
Status: Active, production-oriented, and maintained

## 1. Executive Summary

Casa-MX.com is a Mexico-focused real estate platform that supports:
- Property discovery
- Property publishing
- Rental and sale negotiation flows
- Verification-gated sensitive actions
- Admin moderation and analytics

This document is the current-state source of truth for architecture, policy, operations, and validation. Historical checkpoint progress logs are intentionally excluded.

## 2. Current Validation Snapshot

Verified in this session:
- Playwright end-to-end suite: 34/34 passing (`npx playwright test`)

Recent implementation updates reflected in code:
- User-facing wording standardized from "Dashboard" to "Inicio" in key UI paths
- Navbar auth rendering improved for initial logged-out visibility
- Spanish role labeling consistency expanded across UI and activity surfaces
- E2E stability improvements for integrity and production smoke coverage

## 3. System Architecture

### Frontend (casa-mx)
- Framework: Next.js 15 + React 18
- Styling: Tailwind CSS
- Data and forms: React Query, React Hook Form, Zod
- Testing: Vitest + Playwright
- Default local port: 3000

Primary responsibilities:
- UI rendering and route handling
- Form UX and client-side validation
- Calling backend APIs with cookie-based credentials

### Backend (casa-mx-backend)
- Framework: Fastify + TypeScript
- ORM: Prisma
- Database: PostgreSQL
- Cache/session support: Redis
- Testing: Vitest
- Default local port: 3001

Primary responsibilities:
- Authentication and authorization
- Business rule enforcement
- Validation and persistence
- Administrative and analytics APIs

### Data Services
- PostgreSQL default local port: 5432
- Redis default local port: 6379
- Local container orchestration: Docker Compose

## 4. Security and Access Model

### Authentication
- Cookie-first JWT session model
- Frontend API requests use credentialed calls (`credentials: include`)
- Authorization decisions are enforced server-side

### Roles
- Supported roles include buyer, seller, wholesaler, and admin
- User-facing labels are localized in Spanish where applicable

### Approval Policy
- Admin role is approval-gated
- Non-admin roles are generally auto-approved by current policy

### Sensitive Action Eligibility
Sensitive actions are gated by trust requirements:
- Verified email
- Verified official ID (INE)

Official ID verification is a manual admin review workflow:
- Uploading an ID sets status to pending (not verified automatically).
- Admin users review pending IDs and approve or reject them in admin approvals.
- Users see pending/verified/rejected status in profile settings and account views.

Property publishing is blocked until eligibility requirements are met.

## 5. Core Product Workflows

- Browse and filter properties in Mexico-focused locations
- Register and authenticate
- Create property drafts
- Publish properties after verification eligibility is satisfied
- Submit and manage requests/offers in rental and sale contexts
- Use admin workflows for moderation and approvals

## 6. Repository Layout

Workspace roots:
- `casa-mx` (frontend)
- `casa-mx-backend` (backend)

Key frontend areas:
- `app/` pages and route segments
- `components/` reusable UI and feature components
- `lib/` API clients, queries, helpers
- `tests/` unit/integration and E2E suites

Key backend areas:
- `src/routes/` API route modules
- `src/services/` business logic
- `src/schemas/` validation schemas
- `src/plugins/` Fastify plugins (JWT, Prisma, logging, maps monitoring)
- `prisma/` schema, seed, and migrations
- `tests/` backend test suites

## 7. Local Development and Build Commands

Node.js requirement in both repos:
- >=18 and <=20

### Frontend (`casa-mx`)
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Unit/integration tests: `npm test`
- E2E tests: `npm run test:e2e`

### Backend (`casa-mx-backend`)
- Dev: `npm run dev`
- Build: `npm run build`
- Start (includes deploy migrations): `npm run start`
- Tests: `npm test`
- Prisma migrate dev: `npm run prisma:migrate`
- Prisma seed: `npm run prisma:seed`

## 8. Environment and Operational Requirements

Required operational areas:
- Valid JWT and application secrets
- Database and Redis connectivity
- Maps configuration for enabled mapping features
- Correct CORS/cookie settings between frontend and backend domains

Operational notes:
- Local Docker Compose is for development workflows
- Do not treat local placeholder credentials as production-ready configuration
- Backend start path expects migrations to be deployable in target environment

## 9. Deployment and Runtime Notes

Production readiness should always include:
- Successful frontend production build
- Successful backend production build
- Database migrations applied
- Health checks passing (`/health`, `/version` where configured)
- Smoke and E2E checks on target environment

## 10. Testing Strategy

Testing layers in active use:
- Frontend unit/integration tests (Vitest)
- Backend unit/integration tests (Vitest)
- Browser E2E tests (Playwright)

Recommended validation order:
1. Frontend build
2. Backend build
3. Frontend tests
4. Backend tests
5. Playwright E2E suite

## 11. Documentation Policy

This file is intentionally current-state and operations-focused.

Keep here:
- Active architecture
- Current policy and eligibility rules
- Current scripts and operational expectations
- Latest verified validation snapshot

Move elsewhere (or remove):
- Long historical checkpoint narratives
- Superseded implementation details
- One-off retrospective incident logs that are no longer actionable

## 12. Quick Start Checklist

1. Start PostgreSQL and Redis (local services or Docker Compose).
2. Configure environment variables in both repositories.
3. Install dependencies in both repositories.
4. Run backend (`npm run dev`) on port 3001.
5. Run frontend (`npm run dev`) on port 3000.
6. Confirm health endpoints and frontend reachability.
7. Execute tests before merge/release.

## 13. Redeploy Checklist (April 2026)

Use this checklist exactly before a live redeploy.

### A. Preflight (local or CI)

1. Frontend install and build:
	- `cd casa-mx`
	- `npm ci`
	- `npm run build`
2. Backend install, build, and env validation:
	- `cd ../casa-mx-backend`
	- `npm ci`
	- `npm run check-env`
	- `npm run build`
3. Full regression:
	- Frontend tests: `cd ../casa-mx && npm test`
	- Backend tests: `cd ../casa-mx-backend && npm test`
4. Optional browser smoke before release:
	- `cd ../casa-mx && npm run test:e2e`

### B. Production Environment Gate

Backend required variables:
- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET` (32+ chars)
- `FRONTEND_URL` (https URL)
- `MAPS_API_KEY` (real server-side key)
- `ENABLE_BILLABLE_MAPS=true`

Backend recommended variables:
- `REDIS_URL`
- `JWT_REFRESH_SECRET`
- Stripe, SendGrid, and AWS keys when those features are enabled

Frontend required variables:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_FRONTEND_URL`

Frontend optional variables:
- `NEXT_PUBLIC_BACKEND_URL` (legacy fallback on some debug pages)
- `NEXT_PUBLIC_MAPS_PROXY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_ENABLE_DEBUG_LOGGING`
- `NEXT_PUBLIC_ANALYTICS_ENABLED`
- `NEXT_PUBLIC_ANALYTICS_PROVIDER`

### C. Deploy Sequence

1. Apply backend migrations:
	- `cd casa-mx-backend`
	- `npx prisma migrate deploy`
2. Start backend:
	- `npm run start`
3. Verify backend health:
	- `GET /health` returns `200`
	- `GET /version` returns `200`
4. Deploy/start frontend:
	- `cd ../casa-mx`
	- `npm run build`
	- `npm run start`
5. Run post-deploy smoke:
	- Login flow
	- Property list loads
	- Publish-property eligibility gate behaves correctly
	- Admin pending approvals page loads

### D. Current Sanity Snapshot

Validated in this session:
- Frontend build passes
- Backend build passes
- Prisma migration state is up to date
- Frontend tests pass (`69/69`)
- Backend tests pass (`242/242`)
