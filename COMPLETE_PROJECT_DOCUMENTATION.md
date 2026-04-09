# Casa MX - Complete Project Documentation
## From Phase 1 Step 1 to Phase 2 Completion

> **Documentation source of truth:** This file is the canonical project record. Keep implementation/status updates centralized here first, then mirror concise summaries into `docs/STATUS_AND_RELEASE_NOTES.md` and `SERVER_MANAGEMENT.md`.

**Project Status**: ✅ **COMPLETE** - All 7 Checkpoints Finished
- **Backend Tests**: 230/230 passing
- **Frontend Tests**: 66/66 passing
- **Playwright E2E**: 33/33 passing
- **Total Verified This Session**: 329/329 passing
- **Date Completed**: January 14, 2026
- **Last Updated**: April 8, 2026

### Recent Updates (Feb–Apr 2026)

- ✅ **Frontend auth hardening switched to cookie-first sessions (April 8, 2026)**
  - Removed browser localStorage persistence of access and refresh tokens from the frontend auth client.
  - Property, analytics, and admin debug requests now rely on `credentials: 'include'` and backend cookie verification instead of browser-stored bearer tokens.
  - Updated React Query auth refresh behavior to rotate cookie-backed sessions without requiring a refresh token argument.
  - Validation run after hardening:
    - `tests/lib/auth.test.js` + `tests/lib/auth-context.test.jsx` + `tests/integration/Upload.test.jsx` + `tests/components/PropertyUploadForm.test.jsx` -> **11/11 passed**
    - `tests/e2e/publish-upload-live.spec.ts` -> **1/1 passed** after the cookie-only auth change
  - Release implication:
    - the main remaining auth validation is live cookie behavior between `https://casa-mx.com` and `https://api.casa-mx.com`

- ⚠️ **Public production smoke check found stale frontend deployment (April 8, 2026)**
  - Added reusable public smoke coverage in `tests/e2e/production-smoke.spec.ts`.
  - Local smoke validation passed.
  - Initial public production smoke validation confirmed:
    - `https://casa-mx.com` is reachable
    - `https://api.casa-mx.com/health` is reachable
    - `https://api.casa-mx.com/version` is reachable and reports `environment: production`
  - Initial public production smoke validation failed on the frontend legal surfaces:
    - homepage footer legal links are missing from the deployed site
    - `https://casa-mx.com/privacy` returns 404
    - `https://casa-mx.com/terms` returns 404
    - `https://casa-mx.com/cookie` returns 404
  - Repo state is correct locally (`app/privacy/page.js`, `app/terms/page.js`, `app/cookie/page.js`, footer links in `app/layout.js`), so this points to a stale or incomplete frontend deployment rather than a missing implementation in the codebase.
  - After pushing commit `3d6e3264` and redeploying Vercel, the public smoke check passed:
    - `tests/e2e/production-smoke.spec.ts` -> **1/1 passed** against production
    - `https://casa-mx.com/privacy` returns 200
    - `https://casa-mx.com/terms` returns 200
    - `https://casa-mx.com/cookie` returns 200
  - Remaining release gap after the redeploy:
    - authenticated production publish-flow validation still needs a real seller account

- ✅ **Authenticated production publish-flow smoke passed (April 8, 2026)**
  - Promoted `5axelj@gmail.com` to approved admin in production and used the admin approvals flow to review the seller validation account.
  - Approved the production seller validation account `casamxtestseller@gmail.com` after confirming its pending `seller` role in Railway Postgres.
  - Ran the live production Playwright publish smoke with:
    - `PLAYWRIGHT_BASE_URL=https://casa-mx.com`
    - `PLAYWRIGHT_API_URL=https://api.casa-mx.com`
    - `PLAYWRIGHT_LOGIN_EMAIL=casamxtestseller@gmail.com`
    - `npx playwright test tests/e2e/publish-upload-live.spec.ts`
  - Validation result:
    - `tests/e2e/publish-upload-live.spec.ts` -> **1/1 passed** against production in Chromium
    - seller login succeeded on the live frontend
    - Mexico address selection succeeded
    - property creation request returned success on the production backend
  - Release implication:
    - the core public and authenticated production user journeys are both now validated end to end

- ✅ **Admin approvals Bad Request root cause fixed locally (April 8, 2026)**
  - Root cause:
    - the frontend admin approvals client sent `Content-Type: application/json` on approve/reject POST requests without a request body
    - Fastify treated those requests as malformed and returned `400 Bad Request`
  - Fix applied:
    - `lib/api/users.js` now only sets `Content-Type: application/json` when a JSON body is actually sent
    - approve/reject role actions now post without an empty JSON content-type header
  - Remaining release step:
    - deploy the frontend so the live admin approvals page picks up this fix

- ✅ **Launch-readiness validation rerun completed (April 8, 2026)**
  - Rebuilt both repos successfully with production build commands:
    - Frontend: `next build`
    - Backend: `tsc` + static asset copy + `prisma generate`
  - Recovered and started Docker Desktop, then brought up the backend Compose stack successfully:
    - PostgreSQL healthy on `5432`
    - Redis healthy on `6379`
    - Backend healthy on `3001`
  - Re-ran the previously DB-blocked backend suites after Docker recovery:
    - `tests/checkpoint-rentals-2.test.ts` + `tests/checkpoint5.test.ts` -> **45/45 passed**
  - Re-ran the full automated regression baseline:
    - Full frontend Vitest suite -> **66/66 passed**
    - Full backend Vitest suite -> **230/230 passed**
  - Re-ran the full Playwright browser suite against the real frontend (`localhost:3000`) and Docker-backed backend (`localhost:3001`):
    - Full Playwright suite -> **33/33 passed**
    - Includes the live publish flow in `tests/e2e/publish-upload-live.spec.ts`
  - Compatibility fix applied during E2E hardening:
    - restored stable `propertyType-*` ids on the property type selector
    - updated the Playwright flow to click the visible selection card instead of the hidden radio input
  - Remaining production-launch caveats identified:
    - local backend Compose runtime is still running with `NODE_ENV=development`
    - local backend `.env` still contains a placeholder maps key and should not be treated as production-ready

- ✅ **Publish-flow stabilization + rental metadata expansion revalidated (April 6, 2026)**
  - Restored frontend validation baseline after dependency drift by reinstalling the missing Vitest package tree.
  - Fixed the upload-form test harness after `PropertyUploadForm` started depending on `useAuth()`.
  - Stabilized the maps autocomplete error test by removing fake-timer brittleness and waiting on the real debounced failure path.
  - Fixed backend maps fallback typing so local coordinate helpers return the expected geometry shape during TypeScript build.
  - Added and validated recent property-publishing UX/data work already present in code:
    - image gallery with previous/next controls
    - zero-clearing numeric inputs on focus
    - property-type radio selection
    - rental included-services and amenities metadata
  - Docker Desktop was reinstalled and relaunched locally, restoring PostgreSQL/Redis-backed backend validation.
  - Restored the missing backend container build files and corrected local Docker Compose defaults so the backend now boots in development mode without production-only maps credentials.
  - Validation run after fixes:
    - Frontend targeted test: `tests/components/PropertyUploadForm.test.jsx` (2/2 passed)
    - Frontend production build: `next build` passed
    - Backend production build: `npm run build` passed
    - Backend targeted tests: `checkpoint-rentals-2` + `checkpoint-filters-2` + `checkpoint7` (68/68 passed)
    - Containerized backend health: `docker compose up -d backend` + `GET /health` passed (`database: ok`, `cache: ok`)
    - Full backend Vitest suite: 230/230 passed
    - Full frontend Vitest suite: 57/57 passed at that time; later expanded to 66/66 after Phase 4 frontend coverage additions

- ✅ **Address search/autofill reliability + Google-only maps hardening (March 19, 2026)**
  - Upload address suggestions now display in Google-style primary/secondary format and preserve typed house-number context.
  - Address selection flow improved to better populate `estado`, `ciudad`, `colonia`, and `codigoPostal` from geocoding results.
  - Backend maps autocomplete/geocode path is now Google-only (Nominatim fallback removed for these flows).
  - Added non-test startup fail-fast checks for maps configuration (`MAPS_API_KEY`, `ENABLE_BILLABLE_MAPS=true`) plus clearer maps route error statuses.
  - Resolved local login outage caused by missing `ENABLE_BILLABLE_MAPS` in backend runtime env; backend health restored to 200.
  - Validation run after fixes:
    - Frontend targeted test: `tests/components/PropertyUploadForm.test.jsx` (1/1 passed)
    - Backend targeted tests: `checkpoint-filters-1` + `checkpoint-filters-2` (40/40 passed)
    - Playwright targeted flow: `tests/e2e/publish-upload-live.spec.ts` (1/1 passed)
  - Updated files:
    - `components/PropertyUploadForm.jsx`
    - `casa-mx-backend/src/services/maps.service.ts`
    - `casa-mx-backend/src/config/env.ts`
    - `casa-mx-backend/src/routes/maps.ts`
    - `casa-mx-backend/.env.example`
    - `tests/e2e/publish-upload-live.spec.ts`

- ✅ **Property publishing now appears in listings immediately**
  - Frontend properties query switched from mock data to backend API source.
  - Property publish flow now invalidates cached properties after successful creation.
  - Updated files:
    - `lib/queries/properties.js`
    - `components/PropertyUploadForm.jsx`
    - `lib/api/properties.js`

- ✅ **Properties navbar dropdown implemented**
  - Added dropdown actions for: **Vender**, **Rentar**, **Buscar**, and **Publicar**.
  - Includes click-outside close behavior and seller-only visibility logic for publish action.
  - Updated file:
    - `components/NavBar.jsx`

- ✅ **Backend container startup stabilized**
  - Docker backend image updated to Debian slim base for Prisma runtime compatibility.
  - Fixed ESM runtime import resolution for maps routes by using `.js` extensions in TypeScript imports.
  - Verified backend container health and `/health` endpoint response.
  - Updated files:
    - `casa-mx-backend/Dockerfile`
    - `casa-mx-backend/src/routes/admin/maps.ts`
    - `casa-mx-backend/src/routes/maps.ts`

- ✅ **Runtime compatibility guards added (Node 18–20)**
  - Added startup checks that fail fast for unsupported Node versions to prevent silent frontend/backend crashes.
  - Added engine constraints and `.nvmrc` files in both repositories.
  - Updated files:
    - `package.json`
    - `scripts/check-node-version.js`
    - `start-servers.ps1`
    - `.nvmrc`

- ✅ **Request flow migrated from mocks to backend API**
  - Added backend `/requests` endpoints (authenticated create + buyer list).
  - Replaced frontend request mock/localStorage usage with real API integration.
  - Added request form submission error handling for auth and API failures.
  - Updated files:
    - `casa-mx-backend/src/routes/requests.ts`
    - `casa-mx-backend/src/app.ts`
    - `lib/api/requests.js`
    - `lib/queries/requests.js`
    - `components/RequestInfoForm.jsx`
    - `components/RequestedPropertiesList.jsx`

- ✅ **Auth registration resilience fix applied**
  - User registration now auto-creates missing default roles (`buyer`, `seller`) when database seeds are incomplete.
  - Prevents fresh-environment registration failures due to missing role rows.
  - Updated file:
    - `casa-mx-backend/src/services/auth.service.ts`

- ✅ **Phase 4 test-layer migration completed**
  - Replaced remaining test imports from `lib/mock/*` with API/query-based mocks and local fixtures.
  - Added backend `/requests` endpoint tests and verified full pass.
  - Validation status:
    - Frontend targeted suite: 6 files passed, 7 tests passed.
    - Backend requests suite: 1 file passed, 6 tests passed.

- ✅ **Final no-skip validation and production build verification (March 10, 2026)**
  - Frontend Vitest: **53/53 passed, 0 skipped**.
  - Playwright E2E: **32/32 passed, 0 skipped**.
  - Backend Vitest: **214/214 passed, 0 skipped**.
  - Frontend production build (`next build`): passed.
  - Backend production build (`tsc`): passed.
  - Test-suite hardening updates:
    - `tests/lib/auth.test.js` converted from environment/rate-limit-dependent integration behavior to deterministic API-client tests.
    - `tests/e2e/integrity.spec.ts` no longer conditionally skips the rental-validation adversarial case.
    - `casa-mx-backend/src/app.ts` local-environment global rate-limit ceiling increased to avoid local acceptance-suite exhaustion.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Checkpoint Progress](#checkpoint-progress)
4. [Technology Stack](#technology-stack)
5. [Setup & Installation](#setup--installation)
6. [Running Tests](#running-tests)
7. [API Documentation](#api-documentation)
8. [Key Implementation Details](#key-implementation-details)
9. [Security Features](#security-features)
10. [File Structure](#file-structure)

---

## Project Overview

**Casa MX** is a full-stack property management platform built with:
- **Backend**: TypeScript + Fastify + PostgreSQL + Prisma
- **Frontend**: Next.js + React + TypeScript + Vitest

The application manages property listings, user roles, admin approvals, and analytics tracking with full production-ready security.

### Key Features
- User authentication with JWT tokens and refresh flow
- Role-based access control (buyer, seller, admin)
- Admin role approval workflow with audit logging
- Property listing and search functionality with location filters
- Analytics event tracking and reporting
- CORS protection, rate limiting, input validation
- Environment-specific configuration (test vs production)
- Comprehensive automated test coverage (299 total checks including E2E)

---

## Architecture

### System Overview

Casa MX follows a **modern client-server architecture** with clear separation between frontend presentation and backend business logic:

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Next.js Frontend (Port 3000)                  │  │
│  │  • React Components & Pages                           │  │
│  │  • Client-side routing                                │  │
│  │  • State management (React Context)                   │  │
│  │  • Form validation (Zod)                              │  │
│  └───────────────┬───────────────────────────────────────┘  │
│                  │ HTTP/JSON (REST API)                      │
│                  │ JWT Authentication                        │
└──────────────────┼───────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│         Fastify Backend (Port 3001)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  API Layer (Routes)                                   │  │
│  │  • Auth routes (/auth/*)                              │  │
│  │  • Admin routes (/admin/*)                            │  │
│  │  • Analytics routes (/analytics/*)                    │  │
│  └───────────────┬───────────────────────────────────────┘  │
│                  │                                           │
│  ┌───────────────▼───────────────────────────────────────┐  │
│  │  Middleware & Guards                                  │  │
│  │  • JWT verification                                   │  │
│  │  • Role-based access control                          │  │
│  │  • Input validation (Zod)                             │  │
│  │  • Rate limiting                                      │  │
│  │  • CORS protection                                    │  │
│  └───────────────┬───────────────────────────────────────┘  │
│                  │                                           │
│  ┌───────────────▼───────────────────────────────────────┐  │
│  │  Service Layer                                        │  │
│  │  • Business logic                                     │  │
│  │  • Password hashing                                   │  │
│  │  • Token generation                                   │  │
│  │  • Audit logging                                      │  │
│  └───────────────┬───────────────────────────────────────┘  │
│                  │                                           │
│  ┌───────────────▼───────────────────────────────────────┐  │
│  │  Prisma ORM                                           │  │
│  │  • Type-safe database queries                         │  │
│  │  • Transaction management                             │  │
│  │  • Migration handling                                 │  │
│  └───────────────┬───────────────────────────────────────┘  │
└──────────────────┼───────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│         PostgreSQL Database (Docker)                         │
│  • User accounts & roles                                     │
│  • Property listings                                         │
│  • Analytics events                                          │
│  • Audit logs                                                │
└─────────────────────────────────────────────────────────────┘
```

### Architectural Principles

**1. Separation of Concerns**
- **Frontend**: Handles UI/UX, form validation, routing, and user interaction
- **Backend**: Enforces business rules, security, authorization, and data persistence
- **Database**: Single source of truth for all application data

**2. Security-First Design**
- Authentication happens exclusively on backend
- All permissions enforced server-side
- Frontend never trusted for authorization decisions
- JWT tokens for stateless authentication
- Passwords hashed with bcrypt (never stored in plain text)

**3. RESTful API Design**
- Resource-based endpoints (`/users`, `/properties`, `/admin/roles`)
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent response format: `{ success: boolean, data?: any, error?: string }`
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)

**4. Layered Architecture**
```
Frontend Layers:
├── Pages (routing, data fetching)
├── Components (reusable UI)
├── Guards (route protection)
├── API Clients (HTTP communication)
└── Context (global state)

Backend Layers:
├── Routes (HTTP endpoints)
├── Middleware (authentication, validation)
├── Services (business logic)
├── Schemas (validation rules)
└── Database (Prisma ORM)
```

### Data Flow Examples

**User Authentication Flow:**
```
1. User submits login form
   → Frontend validates input (Zod)
   → POST /auth/login with credentials

2. Backend receives request
   → Validates credentials
   → Checks password hash (bcrypt)
   → Generates JWT tokens
   → Returns tokens + user data

3. Frontend stores tokens
   → Saves to localStorage
   → Updates auth context
   → Redirects to dashboard

4. Subsequent requests
   → Frontend sends JWT in Authorization header
   → Backend verifies JWT on each request
   → Returns protected data if valid
```

**Admin Role Approval Flow:**
```
1. Admin clicks "Approve" on pending role
   → Frontend: POST /admin/roles/:id/approve
   → Includes admin JWT token

2. Backend processes approval
   → Verifies admin role (requireAdmin guard)
   → Starts database transaction
   → Updates UserRole status: pending → approved
   → Creates immutable AuditLog entry
   → Commits transaction
   → Returns success response

3. Frontend updates UI
   → Removes from pending list
   → Shows success message
   → User can now login with approved role
```

**Analytics Event Tracking Flow:**
```
1. User views property
   → Frontend: analytics.track({ eventName: 'property_view', ... })
   → POST /analytics/events with JWT

2. Backend records event
   → Extracts userId from JWT
   → Validates event data (Zod)
   → Stores in AnalyticsEvent table
   → Returns event ID

3. Admin views analytics
   → GET /admin/analytics/summary
   → Backend aggregates events
   → Returns counts, unique users, event types
```

### Technology Choices & Rationale

**Backend: Fastify**
- ✅ High performance (up to 2x faster than Express)
- ✅ Schema-first design (built-in validation)
- ✅ TypeScript support out of the box
- ✅ Rich plugin ecosystem
- ✅ Async/await native support

**Database: PostgreSQL + Prisma**
- ✅ ACID compliance (critical for financial/audit data)
- ✅ Type-safe queries (Prisma generates types from schema)
- ✅ Migration system (version control for database)
- ✅ No SQL injection vulnerabilities
- ✅ JSON support (for flexible metadata storage)

**Frontend: Next.js + React**
- ✅ Server-side rendering (better SEO)
- ✅ File-based routing (intuitive structure)
- ✅ Built-in optimization (image, font, code splitting)
- ✅ API routes support (could add BFF layer if needed)
- ✅ Large ecosystem and community

**Authentication: JWT**
- ✅ Stateless (no server-side session storage)
- ✅ Scalable (works across multiple servers)
- ✅ Self-contained (includes user info in token)
- ✅ Standard (widely supported)
- ✅ Short-lived access + long-lived refresh tokens

**Validation: Zod**
- ✅ TypeScript-first (type inference)
- ✅ Runtime validation (catches bad data)
- ✅ Shared between frontend and backend
- ✅ Composable schemas (DRY principle)
- ✅ Clear error messages

### Environment Configuration

The system supports environment-specific configuration:

**Development Mode** (`NODE_ENV=development`):
- Verbose logging (pino-pretty formatting)
- Detailed error messages with stack traces
- Hot reload (tsx watch for backend, Next.js for frontend)
- No HTTPS required
- Permissive CORS for localhost

**Test Mode** (`NODE_ENV=test`):
- Higher rate limits (prevent test interference)
- Isolated test database
- Synchronous test execution
- Mock external services
- Clean database between test suites

**Production Mode** (`NODE_ENV=production`):
- Minimal logging (JSON format)
- Generic error messages (no stack traces)
- Strict CORS (specific origins only)
- Lower rate limits (prevent abuse)
- HTTPS enforced
- Database connection pooling

### Backend Structure
```
casa-mx-backend/
├── src/
│   ├── server.ts              # Entry point, starts Fastify
│   ├── app.ts                 # App factory with plugin registration
│   ├── config/
│   │   └── env.ts             # Environment variables with Zod validation
│   ├── plugins/
│   │   ├── prisma.ts          # Prisma ORM plugin
│   │   └── jwt.ts             # JWT authentication plugin
│   ├── routes/
│   │   ├── health.ts          # Health check endpoint
│   │   ├── auth.ts            # Register, login, refresh, logout, getSession
│   │   ├── admin.ts           # Approve/deny roles, view users, audit logs
│   │   └── analytics.ts       # Track events, query analytics
│   ├── services/
│   │   ├── auth.service.ts    # Business logic for authentication
│   │   └── analytics.service.ts # Analytics queries
│   ├── schemas/
│   │   ├── auth.ts            # Zod validation schemas for auth
│   │   ├── admin.ts           # Zod validation for admin routes
│   │   └── analytics.ts       # Zod validation for analytics
│   ├── utils/
│   │   └── guards.ts          # JWT verification, role-based access guards
│   └── prisma/
│       └── schema.prisma      # Database models and migrations
├── tests/
│   ├── health.test.ts                # Health check tests (3 tests)
│   ├── checkpoint1.test.ts           # Database model tests (11 tests)
│   ├── checkpoint2.test.ts           # Auth tests (15 tests)
│   ├── checkpoint3.test.ts           # Authorization tests (12 tests)
│   ├── checkpoint4.test.ts           # Admin approval tests (11 tests)
│   ├── checkpoint5.test.ts           # Analytics tests (26 tests)
│   ├── checkpoint7.test.ts           # Hardening tests (15 tests)
│   ├── checkpoint-filters-1.test.ts  # Location filter tests (12 tests)
│   └── checkpoint-filters-2.test.ts  # Location API tests (28 tests)
└── package.json                      # Dependencies

Frontend Structure
casa-mx/
├── app/
│   ├── layout.js              # Root layout with auth provider
│   ├── page.js                # Home page
│   ├── login/page.js          # Login form
│   ├── register/page.js       # Registration form with role selection
│   ├── properties/
│   │   ├── page.js            # Property listing page
│   │   └── [id]/page.js       # Single property detail
│   ├── upload/page.js         # Property upload form
│   ├── requested/page.js      # Requested properties list
│   └── admin/approvals/page.js # Admin role approvals dashboard
├── components/
│   ├── AuthContext.jsx        # React context for auth state
│   ├── NavBar.jsx             # Navigation bar
│   ├── PropertyCard.jsx       # Property list item
│   ├── PropertyList.jsx       # Property list container
│   ├── PropertyUploadForm.jsx # Form for uploading properties
│   ├── RoleSelector.jsx       # Role selection dropdown
│   ├── RequestInfoForm.jsx    # Form for requesting info
│   └── guards/
│       ├── RequireAuth.jsx    # Auth guard component
│       └── RequireRole.jsx    # Role-based access guard
├── lib/
│   ├── api/
│   │   ├── auth.js            # HTTP client for auth API
│   │   ├── properties.js      # HTTP client for properties API
│   │   ├── requests.js        # HTTP client for requests API
│   │   └── users.js           # HTTP client for users API
│   ├── analytics/
│   │   ├── index.js           # Analytics event tracking system
│   │   └── providers/
│   │       ├── consoleProvider.js  # Console logging provider
│   │       └── apiProvider.js      # Backend API provider
│   ├── auth/
│   │   ├── AuthContext.jsx    # Auth context state management
│   │   └── useAuth.js         # Auth hook
│   ├── queries/
│   │   ├── properties.js      # React Query hooks for properties
│   │   └── requests.js        # React Query hooks for requests
│   ├── storage/
│   │   └── storage.js         # LocalStorage utilities
│   └── validation/
│       ├── propertySchema.js  # Zod schemas for properties
│       └── requestSchema.js   # Zod schemas for requests
├── tests/
│   ├── components/            # Component unit tests (7 files)
│   ├── integration/           # Integration tests (4 files)
│   └── lib/                   # Library tests (2 files)
├── package.json
├── jsconfig.json
├── vitest.config.js
└── vitest.setup.js
```

---

## Checkpoint Progress

### ✅ Checkpoint 0 — Backend Bootstrap
**Status**: COMPLETE (3/3 tests passing)

**What Was Done**:
- Set up TypeScript + Fastify backend
- Configured PostgreSQL connection via Prisma ORM
- Implemented health check endpoint (`GET /health`)
- Set up development server with `tsx watch`
- Configured logging with pino + pino-pretty

**Key Files**:
- `src/server.ts` - Server entry point
- `src/app.ts` - Fastify app factory with plugin registration
- `src/plugins/prisma.ts` - Prisma client initialization
- `prisma/schema.prisma` - Database schema

**Tests**:
```
✓ Health check endpoint responds with 200 OK
✓ Server starts without errors
✓ Database connection established
```

---

### ✅ Checkpoint 1 — Database Models & Migrations
**Status**: COMPLETE (11/11 tests passing)

**Database Schema Implemented**:

1. **User** - User accounts
   - `id`: UUID primary key
   - `email`: Unique, indexed for fast lookups
   - `name`: Display name
   - `password`: Hashed with bcrypt
   - `createdAt`, `updatedAt`: Timestamps

2. **Role** - Available roles (buyer, seller, admin)
   - `id`: UUID primary key
   - `name`: Unique role name
   - `createdAt`: Timestamp

3. **UserRole** - User role assignments with approval status
   - `id`: UUID primary key
   - `userId`: Foreign key to User
   - `roleId`: Foreign key to Role
   - `status`: 'pending' | 'approved' | 'denied'
   - `createdAt`, `updatedAt`: Timestamps
   - **Unique constraint**: One user can't have duplicate roles
   - **Cascade delete**: When user deleted, all UserRoles deleted

4. **Property** - Property listings
   - `id`: UUID primary key
   - `address`: Property address
   - `description`: Property details
   - `price`: Listing price
   - `ownerId`: Foreign key to User
   - `createdAt`, `updatedAt`: Timestamps

5. **Request** - Information requests on properties
   - `id`: UUID primary key
   - `propertyId`: Foreign key to Property
   - `requesterId`: Foreign key to User
   - `message`: Request message
   - `status`: 'pending' | 'responded'
   - `createdAt`, `updatedAt`: Timestamps

6. **AnalyticsEvent** - Event tracking for analytics
   - `id`: UUID primary key
   - `eventName`: Type of event (e.g., 'property_view', 'property_upload')
   - `userId`: Foreign key to User
   - `entityId`: Optional reference to related entity
   - `metadata`: JSON object for additional data
   - `createdAt`: Timestamp

7. **AuditLog** - Immutable audit trail for admin actions
   - `id`: UUID primary key
   - `actorUserId`: Admin who performed action
   - `targetUserId`: User affected by action
   - `action`: Description of action
   - `previousState`: JSON of old values
   - `newState`: JSON of new values
   - `createdAt`: Timestamp (no updates allowed)

**Key Features**:
- All relations properly defined with cascade deletes
- Indexes on frequently queried columns
- Timestamps for audit trails
- Composite unique constraints where needed

**Tests**:
```
✓ User model exists and can CRUD
✓ Role model exists with buyer/seller/admin
✓ UserRole join table works correctly
✓ Property model exists and relates to User
✓ Request model exists with statuses
✓ AnalyticsEvent model stores events
✓ AuditLog model is immutable
✓ Cascade deletes work (deleting user deletes roles)
✓ All required role records created on seed
```

---

### ✅ Checkpoint 2 — Authentication & Admin Bootstrap
**Status**: COMPLETE (15/15 tests passing)

**Authentication Flow Implemented**:

1. **User Registration** (`POST /auth/register`)
   ```json
   Request: {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "SecurePassword123!",
     "roles": ["buyer", "seller"]
   }
   Response: {
     "success": true,
     "user": {
       "id": "uuid",
       "name": "John Doe",
       "email": "john@example.com",
       "roles": [
         {"type": "buyer", "status": "pending"},
         {"type": "seller", "status": "pending"}
       ]
     }
   }
   ```
   - Password hashed with bcrypt (10 rounds)
   - User gets default buyer/seller roles (pending approval)
   - Returns user profile with role statuses

2. **User Login** (`POST /auth/login`)
   ```json
   Request: {
     "email": "john@example.com",
     "password": "SecurePassword123!"
   }
   Response: {
     "success": true,
     "user": { ... },
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
   }
   ```
   - Issues JWT access token (15 minute expiry)
   - Issues refresh token (7 day expiry)
   - Tokens stored in HTTP-only cookies (frontend stores in localStorage)

3. **Token Refresh** (`POST /auth/refresh`)
   - Takes refresh token from body
   - Returns new access token if valid
   - Rejects if refresh token expired or invalid

4. **Get Session** (`GET /auth/me`)
   - Returns current authenticated user profile
   - Requires valid JWT in Authorization header
   - Returns user with all approved roles

5. **Admin Seeding**
   - One admin user created on first run
   - Email: `admin@casa-mx.com`
   - Password: `AdminPassword123!`
   - Has admin role (auto-approved)

**Key Implementation Details**:
- `bcrypt.hash()` with 10 rounds for password hashing
- `@fastify/jwt` plugin for token signing/verification
- JWT payload includes: `{id, email, roles, type: 'access'}`
- Refresh token has `{id, type: 'refresh'}`

**Tests**:
```
✓ User can register with valid credentials
✓ Registration requires valid email format
✓ Registration requires password minimum 8 characters
✓ Login succeeds with correct email/password
✓ Login fails with wrong password
✓ Login fails with non-existent email
✓ JWT token is properly formatted and can be verified
✓ Token includes user ID and roles
✓ Admin user created via seed
✓ Admin can login with correct password
✓ Token refresh returns new valid token
✓ Invalid refresh token is rejected
```

---

### ✅ Checkpoint 3 — Authorization & Guards
**Status**: COMPLETE (12/12 tests passing)

**Access Control Implemented**:

1. **JWT Verification Guard** (`verifyJWT`)
   ```typescript
   // Middleware that validates JWT in Authorization header
   // Extracts token from "Bearer <token>"
   // Verifies signature and expiry
   // Attaches user to request.user
   ```

2. **Role-Based Guard** (`requireRole(role)`)
   ```typescript
   // Checks if authenticated user has specific role with 'approved' status
   // Returns 403 Forbidden if user lacks required role
   // Example: requireRole('admin') only allows admin users
   ```

3. **Admin-Only Guard** (`requireAdmin`)
   ```typescript
   // Shortcut for requireRole('admin')
   // Used on all admin endpoints
   ```

4. **Protected Routes**:
   - `GET /auth/me` - Requires authentication
   - `POST /auth/refresh` - Requires valid refresh token
   - `POST /auth/logout` - Requires authentication
   - `GET /admin/*` - Requires admin role
   - `POST /admin/*` - Requires admin role
   - `POST /analytics/events` - Requires authentication

**Role Approval Flow**:
1. User registers → Gets roles with `status: 'pending'`
2. Admin reviews pending roles → Approves or denies
3. Only 'approved' roles grant access to role-specific features
4. User cannot access features until role approved

**Tests**:
```
✓ Unauthenticated requests are rejected with 401
✓ Requests with invalid tokens are rejected
✓ Non-admin users cannot access /admin endpoints
✓ Admin users can access /admin endpoints
✓ Users cannot access features for unapproved roles
✓ Role spoofing (faking roles in JWT) is caught
✓ Expired tokens are rejected
✓ Token verification happens on every request
✓ Invalid token format is rejected
```

---

### ✅ Checkpoint 4 — Admin Authority & Audit Logs
**Status**: COMPLETE (11/11 tests passing)

**Admin Approval System**:

1. **Approve Role** (`POST /admin/roles/:userRoleId/approve`)
   ```json
   Request: {
     Authorization: "Bearer <admin-token>"
   }
   Response: {
     "success": true,
     "data": {
       "id": "uuid",
       "userId": "uuid",
       "roleId": "uuid",
       "status": "approved"
     },
     "message": "Role approved successfully"
   }
   ```
   - Admin endpoint only
   - Changes UserRole status from 'pending' to 'approved'
   - Creates audit log entry

2. **Deny Role** (`POST /admin/roles/:userRoleId/deny`)
   - Similar to approve, but sets status to 'denied'
   - Creates audit log with denial reason

3. **View Pending Roles** (`GET /admin/pending-roles`)
   - Returns all roles waiting for approval
   - Admin only

4. **View All Users** (`GET /admin/users`)
   - Lists all users with their roles
   - Admin only

5. **View Audit Logs** (`GET /admin/audit-logs`)
   - Returns chronological audit trail
   - Admin only
   - Immutable (cannot be modified)

**Audit Logging**:
```typescript
// Every admin action creates immutable log entry
{
  id: uuid,
  actorUserId: "admin-id",      // Which admin did it
  targetUserId: "affected-id",   // Who was affected
  action: "approve_role",         // What action
  previousState: { status: "pending" },  // Before
  newState: { status: "approved" },      // After
  createdAt: timestamp
}
```

**Key Features**:
- Audit logs stored as JSON for flexible tracking
- Entries are immutable (no updates allowed)
- Every admin action logged automatically
- Helps track who changed what and when

**Tests**:
```
✓ Admin can approve pending roles
✓ Admin can deny pending roles
✓ Cannot approve already approved role
✓ Cannot approve non-existent role
✓ Non-admin cannot approve roles
✓ Non-admin cannot deny roles
✓ Audit log created for every approval
✓ Audit log created for every denial
✓ Audit logs are immutable
✓ Audit logs have correct fields
✓ Non-admin cannot view audit logs
```

---

### ✅ Checkpoint 5 — Backend Analytics API
**Status**: COMPLETE (26/26 tests passing)

**Event Tracking System**:

1. **Track Event** (`POST /analytics/events`)
   ```json
   Request: {
     "eventName": "property_view",
     "entityId": "property-uuid",
     "metadata": {
       "duration": 45,
       "source": "search"
     }
   }
   Response: {
     "success": true,
     "data": {
       "id": "uuid",
       "eventName": "property_view",
       "userId": "uuid",
       "entityId": "property-uuid",
       "metadata": { ... },
       "createdAt": "2026-01-14T06:00:00Z"
     }
   }
   ```
   - Requires authentication
   - Auto-associates event with current user
   - Stores arbitrary metadata as JSON
   - Used for all trackable actions

2. **Analytics Summary** (`GET /admin/analytics/summary`)
   ```json
   Response: {
     "success": true,
     "data": {
       "totalEvents": 245,
       "uniqueUsers": 18,
       "eventTypes": ["property_view", "property_upload", "role_approval"],
       "eventCountsByType": {
         "property_view": 120,
         "property_upload": 85,
         "role_approval": 40
       }
     }
   }
   ```
   - Admin only
   - Quick overview of analytics

3. **Analytics Events List** (`GET /admin/analytics/events`)
   - Returns all events in descending date order
   - Paginated with limit/offset
   - Admin only

4. **Filter Events by Name** (`GET /admin/analytics/events-by-name?eventName=property_view`)
   - Filter events by type
   - Paginated results
   - Admin only

**Event Types Tracked**:
- `user_registration` - When user registers
- `role_approval` - When admin approves role
- `role_denial` - When admin denies role
- `property_view` - When user views property
- `property_upload` - When user uploads property
- `info_request` - When user requests property info
- `info_response` - When owner responds to request

**Tests**:
```
✓ Authenticated user can track event
✓ Event is persisted to database
✓ Event includes user ID
✓ Metadata is stored as JSON
✓ Metadata is optional
✓ Admin can access analytics summary
✓ Summary includes total event count
✓ Summary includes unique user count
✓ Summary includes event types
✓ Summary includes event counts by type
✓ Admin can fetch all events
✓ Events returned in descending date order
✓ Events list is paginated
✓ Admin can filter events by name
✓ Filtered results only contain matching events
✓ Non-admin cannot access analytics
```

---

### ✅ Checkpoint 6 — Frontend Migration
**Status**: COMPLETE (29/29 tests passing)

**Frontend Updated to Use Real Backend APIs**:

1. **HTTP Auth Client** (`lib/api/auth.js`)
   ```javascript
   export async function register(payload)     // POST /auth/register
   export async function login(payload)        // POST /auth/login
   export async function getSession()          // GET /auth/me
   export async function logout()              // POST /auth/logout
   export async function refreshAccessToken()  // POST /auth/refresh
   ```
   - Replaced mock storage with HTTP calls
  - Uses httpOnly cookies plus `credentials: 'include'`
   - Proper error handling and validation

2. **Auth Context Updates** (`lib/auth/AuthContext.jsx`)
   - Synced with backend authentication
  - Stores authenticated user/session metadata only
  - Auto-refresh on cookie-backed session expiry
  - Logout clears the backend cookies

3. **Login Form** (`app/login/page.js`)
   ```jsx
   - Email input
   - Password input (new)
   - Login button
   - Error display
   - Redirect to properties on success
   ```

4. **Registration Form** (`app/register/page.js`)
   ```jsx
   - Name input
   - Email input
   - Password input (new, min 8 chars)
   - Role selector (buyer/seller)
   - Register button
   - Success message with instructions
   ```

5. **Analytics Integration** (`lib/analytics/providers/apiProvider.js`)
   ```javascript
   export const apiProvider = {
     track: async ({eventName, entityId, metadata}) => {
       // POST to /analytics/events with JWT
       // Handles token from localStorage
     }
   }
   ```
   - New backend analytics provider
   - Replaces console/localStorage tracking
   - Uses JWT for authentication

6. **Admin Approvals Dashboard** (preparation)
   - Ready for role approval workflow
   - Uses admin API endpoints

**Key Changes**:
- All API calls now use real HTTP to backend
- Password fields added to forms
- Zod validation on frontend matches backend
- JWT tokens managed in localStorage
- Error messages from backend displayed

**Test Results**: 29/29 passing
```
✓ Auth API tests (register, login, getSession, logout)
✓ Property upload form tests
✓ Registration page tests
✓ Login page tests
✓ Navigation bar tests
✓ Analytics tests
✓ Storage tests
✓ All integration tests
```

---

### ✅ Checkpoint 7 — Hardening & Production Readiness
**Status**: COMPLETE (15/15 tests passing, 133 total backend tests passing)

**Recent Enhancements (January 26, 2026)**:
- Fixed input validation to run before authentication guards
- Added manual Zod validation in admin route handlers
- Configured environment-specific rate limits (test vs production)
- Split checkpoint7 tests for better isolation
- All 133 backend tests now passing

**1. Input Validation with Zod**:

Auth Routes:
```typescript
RegisterSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be 8+ chars"),
  roles: z.array(z.string()).min(1, "At least 1 role required")
})

LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required")
})
```

Admin Routes:
```typescript
UserRoleIdParamSchema = z.object({
  userRoleId: z.string().uuid("Invalid UUID")
})
```

Analytics Routes:
```typescript
AnalyticsEventSchema = z.object({
  eventName: z.string().min(1, "Event name required"),
  entityId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional()
})
```

**Validation Behavior**:
- All requests validated with Zod before processing
- Invalid requests return 400 Bad Request with error details
- Malformed JSON returns 400
- Missing required fields return 400
- Invalid email format returns 400
- Invalid UUID in params returns 400

**2. Rate Limiting** (`@fastify/rate-limit v9.1.0`):

```typescript
Environment-Specific Limits:

Production:
- Global: 100 requests per 15 minutes
- Register: 5 attempts per 15 minutes
- Login: 10 attempts per 15 minutes

Test Environment:
- Global: 500 requests per 15 minutes
- Register: 50 attempts per 15 minutes
- Login: 100 attempts per 15 minutes

All limits return: 429 Too Many Requests when exceeded
```

**3. CORS Configuration** (`@fastify/cors v9.0.1`):

```typescript
{
  origin: "http://localhost:3000",  // Frontend URL
  credentials: true,                 // Allow cookies/headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}
```

**Features**:
- Preflight OPTIONS requests handled automatically
- Credentials allowed for JWT in headers
- Only specified origin can access
- CORS headers included in all responses

**4. Token Security**:

Access Token:
- Algorithm: HS256 (HMAC SHA-256)
- Expiry: 15 minutes
- Payload: `{id, email, roles, type: 'access'}`
- Verified on every protected request
- Expired tokens rejected with 401

Refresh Token:
- Algorithm: HS256
- Expiry: 7 days
- Payload: `{id, type: 'refresh'}`
- Used only for getting new access token
- Cannot be used for API calls

**5. Error Handling**:

```
400 Bad Request - Validation failed
401 Unauthorized - Missing/expired token
403 Forbidden - Role not approved
404 Not Found - Resource doesn't exist
409 Conflict - Email already exists
429 Too Many Requests - Rate limited
500 Internal Server Error - Database/server error
```

All errors return JSON:
```json
{
  "success": false,
  - Tokens stored in HTTP-only cookies
  "details": {} // Optional validation details
}
  - Accepts refresh token from cookie or body

**Security Summary**:
- ✅ All inputs validated with Zod
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWTs signed and verified
  - Accepts a valid auth cookie or Authorization header
- ✅ CORS configured
- ✅ SQL injection prevented via Prisma ORM
- ✅ XSS protected via React + Content-Type headers
- ✅ Audit logging for all admin actions
- ✅ Immutable audit trails
- ✅ Role-based access control enforced

---

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.5.4
- **Framework**: Fastify 4.28.1
- **Database**: PostgreSQL 16 (Docker)
- **ORM**: Prisma 5.19.0
- **Validation**: Zod (latest)
- **Authentication**: @fastify/jwt 8.0.1
- **Password Hashing**: bcrypt
- **Security**: @fastify/cors 9.0.1, @fastify/rate-limit 9.1.0
- **Testing**: Vitest 2.1.9
- **Logging**: Pino + pino-pretty

### Frontend
- **Framework**: Next.js 13.5.11
- **Language**: JavaScript (JSX)
- **UI Library**: React 18.2.0
- **Styling**: Tailwind CSS
- **Form Validation**: Zod
- **Testing**: Vitest 1.2.0
- **HTTP Client**: Fetch API
- **State Management**: React Context + Hooks
- **Build Tool**: Vite (via Next.js)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database Container**: postgres:16
- **Package Manager**: npm
- **Version Control**: Git

---

## Setup & Installation

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher
- Docker and Docker Compose
- Git

### Backend Setup

```bash
# 1. Navigate to backend directory
cd casa-mx-backend

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env
# Edit .env with your settings:
# DATABASE_URL="postgresql://user:password@localhost:5432/casa_mx"
# JWT_SECRET="your-secret-key-min-32-chars"
# FRONTEND_URL="http://localhost:3000"
# NODE_ENV="development"

# 4. Start PostgreSQL via Docker Compose
docker compose up -d

# 5. Run database migrations
npx prisma migrate dev --name init

# 6. Generate Prisma client
npx prisma generate

# 7. Start backend server
npm run dev
# Server runs on http://localhost:3001
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd casa-mx

# 2. Install dependencies
npm install

# 3. Create .env.local (optional, uses defaults)
# NEXT_PUBLIC_API_URL="http://localhost:3001"

# 4. Start development server
npm run dev
# App runs on http://localhost:3000
```

---

## Running Tests

### Backend Tests
```bash
cd casa-mx-backend

# Run all tests
npm test

# Run specific checkpoint
npm test -- checkpoint2

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

**Expected Output**:
```
Test Files  9 passed (9)
  Tests  133 passed (133)
  Duration  5-6s
```

### Frontend Tests
```bash
cd casa-mx

# Run all tests
npm test -- --run

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- auth.test.js
```

**Expected Output**:
```
Test Files  13 passed (13)
  Tests  29 passed (29)
  Duration  10-15s
```

### Run All Tests Together
```bash
cd casa-mx

# Run the helper script (requires backend running on :3001)
.\run-all-tests.ps1
```

---

## API Documentation

### Authentication Endpoints

#### 1. Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "roles": ["buyer", "seller"]
}

Response 201:
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": [
      {"type": "buyer", "status": "pending"},
      {"type": "seller", "status": "pending"}
    ]
  },
  "message": "User registered successfully"
}

Response 400: Validation error
Response 409: Email already exists
```

#### 2. Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response 200:
{
  "success": true,
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response 400: Invalid credentials
```

#### 3. Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response 200:
{
  "id": "uuid",
  "email": "john@example.com",
  "name": "John Doe",
  "roles": [ ... ]
}

Response 401: No valid token
```

#### 4. Refresh Token
```
POST /auth/refresh
Content-Type: application/json

Response 200:
{
  "token": "new-access-token",
  "refreshToken": "new-or-same-refresh-token"
}

Response 401: Invalid refresh token
```

#### 5. Logout
```
POST /auth/logout
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Admin Endpoints

#### View Pending Roles
```
GET /admin/pending-roles
Authorization: Bearer <admin-token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "roleId": "uuid",
      "user": { "id": "uuid", "email": "...", "name": "..." },
      "role": { "id": "uuid", "name": "buyer" },
      "status": "pending"
    }
  ]
}

Response 403: Not authorized
```

#### Approve Role
```
POST /admin/roles/:userRoleId/approve
Authorization: Bearer <admin-token>

Response 200:
{
  "success": true,
  "data": { ... },
  "message": "Role approved successfully"
}

Response 404: Role not found
```

#### Deny Role
```
POST /admin/roles/:userRoleId/deny
Authorization: Bearer <admin-token>

Response 200:
{
  "success": true,
  "data": { ... },
  "message": "Role denied successfully"
}
```

#### Get All Users
```
GET /admin/users
Authorization: Bearer <admin-token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "roles": [ ... ]
    }
  ]
}
```

#### Get Audit Logs
```
GET /admin/audit-logs
Authorization: Bearer <admin-token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "actorUserId": "uuid",
      "targetUserId": "uuid",
      "action": "approve_role",
      "previousState": { "status": "pending" },
      "newState": { "status": "approved" },
      "createdAt": "2026-01-14T06:00:00Z"
    }
  ]
}
```

### Analytics Endpoints

#### Track Event
```
POST /analytics/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventName": "property_view",
  "entityId": "property-uuid",
  "metadata": {
    "duration": 45,
    "source": "search"
  }
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "eventName": "property_view",
    "userId": "uuid",
    "entityId": "property-uuid",
    "metadata": { ... },
    "createdAt": "2026-01-14T06:00:00Z"
  }
}

Response 400: Validation error
Response 401: Not authenticated
```

#### Get Analytics Summary
```
GET /admin/analytics/summary
Authorization: Bearer <admin-token>

Response 200:
{
  "success": true,
  "data": {
    "totalEvents": 245,
    "uniqueUsers": 18,
    "eventTypes": [ ... ],
    "eventCountsByType": { ... }
  }
}
```

#### Get All Events
```
GET /admin/analytics/events?limit=20&offset=0
Authorization: Bearer <admin-token>

Response 200:
{
  "success": true,
  "data": [ ... ]
}
```

#### Filter Events by Name
```
GET /admin/analytics/events-by-name?eventName=property_view&limit=20&offset=0
Authorization: Bearer <admin-token>

Response 200:
{
  "success": true,
  "data": [ ... ]
}
```

#### Health Check
```
GET /health

Response 200:
{
  "status": "ok"
}
```

---

## Key Implementation Details

### Password Security
```typescript
// Registration: Hash password before storing
const hashedPassword = await bcrypt.hash(password, 10);
await prisma.user.create({
  data: {
    email,
    name,
    password: hashedPassword,
    // ...
  }
});

// Login: Compare provided password with hash
const passwordMatch = await bcrypt.compare(inputPassword, user.password);
if (!passwordMatch) throw new Error('Invalid password');
```

### JWT Token Management
```typescript
// Signing tokens with Fastify JWT
const token = fastify.jwt.sign(
  { id: user.id, email: user.email, roles: [...], type: 'access' },
  { expiresIn: '15m' }
);

const refreshToken = fastify.jwt.sign(
  { id: user.id, type: 'refresh' },
  { expiresIn: '7d' }
);

// Verifying tokens (automatic on protected routes)
fastify.register(jwtPlugin); // Adds @fastify/jwt
// Now any route can use onRequest: [fastify.authenticate]
```

### Role-Based Access Control
```typescript
// In routes file
fastify.post(
  '/admin/roles/:userRoleId/approve',
  { onRequest: [requireAdmin] },  // Protect with admin guard
  async (request, reply) => {
    const { userRoleId } = request.params;
    const adminId = request.user.id; // From JWT
    // ...
  }
);

// Guard implementation
export async function requireAdmin(request, reply) {
  await request.jwtVerify(); // Verify JWT (automatic)
  const hasAdminRole = request.user.roles.some(
    r => r.name === 'admin' && r.status === 'approved'
  );
  if (!hasAdminRole) reply.code(403).send({ error: 'Forbidden' });
}
```

### Database Transactions
```typescript
// For atomic operations (approve role + create audit log)
return await prisma.$transaction(async (tx) => {
  // Update role status
  const updated = await tx.userRole.update({
    where: { id: userRoleId },
    data: { status: 'approved' }
  });

  // Create audit log
  await tx.auditLog.create({
    data: {
      actorUserId: adminId,
      targetUserId: userRole.userId,
      action: 'approve_role',
      previousState: { status: 'pending' },
      newState: { status: 'approved' }
    }
  });

  return updated;
  // Both succeed or both fail - no partial state
});
```

### Input Validation Pipeline
```typescript
// Route handler validates all inputs with Zod
fastify.post('/auth/register', async (request, reply) => {
  try {
    // Zod automatically validates against schema
    const input = RegisterSchema.parse(request.body);
    // At this point, input is guaranteed to be valid

    const user = await authService.register(input);
    return reply.code(201).send({ success: true, user });
  } catch (error) {
    if (error instanceof Error && error.constructor.name === 'ZodError') {
      return reply.code(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    // ...
  }
});
```

### Analytics Event Tracking
```typescript
// Frontend tracks events
import { analytics } from '@/lib/analytics';

function PropertyCard({ property }) {
  const handleView = () => {
    // Track that user viewed this property
    analytics.track({
      eventName: 'property_view',
      entityId: property.id,
      metadata: {
        price: property.price,
        location: property.address
      }
    });
  };

  return (
    <div onClick={handleView}>
      {/* ... */}
    </div>
  );
}

// Backend receives and stores
// POST /analytics/events with JWT
// Response includes event ID and timestamp
```

---

## Security Features

### 1. Authentication Layer
- ✅ User registration with email validation
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT tokens with 15-minute expiry
- ✅ Refresh tokens with 7-day expiry
- ✅ HTTP-only cookie storage (recommended)
- ✅ Token refresh mechanism

### 2. Authorization Layer
- ✅ JWT verification on all protected endpoints
- ✅ Role-based access control (buyer, seller, admin)
- ✅ Role approval workflow (pending → approved → access granted)
- ✅ Admin-only endpoint guards
- ✅ Cannot access features with pending roles

### 3. Data Validation
- ✅ Zod schemas for all inputs
- ✅ Email format validation
- ✅ Password strength requirements (min 8 chars)
- ✅ UUID validation for IDs
- ✅ JSON schema validation for metadata
- ✅ Rejects malformed requests early (400)

### 4. Rate Limiting
- ✅ Global: 1000 requests per 15 minutes
- ✅ Per-route limits prepared for auth endpoints
- ✅ Returns 429 when limit exceeded
- ✅ Prevents brute force attacks

### 5. CORS Protection
- ✅ Restricted to `http://localhost:3000`
- ✅ Credentials allowed for JWT
- ✅ Preflight requests handled
- ✅ Prevents unauthorized cross-origin access

### 6. Database Security
- ✅ Prisma ORM (prevents SQL injection)
- ✅ Parameterized queries
- ✅ Password never logged
- ✅ Immutable audit logs

### 7. Error Handling
- ✅ Generic error messages (don't leak info)
- ✅ Detailed errors in development mode
- ✅ Proper HTTP status codes
- ✅ No stack traces in responses

### 8. Audit Trail
- ✅ All admin actions logged
- ✅ User ID, action, timestamp recorded
- ✅ Before/after state captured
- ✅ Immutable (no updates)
- ✅ Searchable by admin

---

## File Structure & Key Files

### Backend Core Files
- **`src/server.ts`** - Server startup, listens on port 3001
- **`src/app.ts`** - Fastify app configuration, plugin registration
- **`src/plugins/prisma.ts`** - Database connection
- **`src/plugins/jwt.ts`** - JWT authentication setup
- **`prisma/schema.prisma`** - Database schema definition
- **`.env`** - Environment variables (DATABASE_URL, JWT_SECRET, etc.)

### Backend Routes
- **`src/routes/health.ts`** - Health check endpoint
- **`src/routes/auth.ts`** - Register, login, refresh, logout
- **`src/routes/admin.ts`** - Role approvals, user management, audit logs
- **`src/routes/analytics.ts`** - Event tracking and queries

### Backend Business Logic
- **`src/services/auth.service.ts`** - User registration, password hashing, login logic
- **`src/services/analytics.service.ts`** - Event storage and analytics queries
- **`src/utils/guards.ts`** - JWT verification, role-based access guards
- **`src/schemas/*.ts`** - Zod validation schemas

### Backend Tests
- **`tests/health.test.ts`** - Server health check
- **`tests/checkpoint0.test.ts`** - Bootstrap tests
- **`tests/checkpoint1-5.test.ts`** - Feature tests
- **`tests/checkpoint7.test.ts`** - Security tests

### Frontend Core Files
- **`app/layout.js`** - Root layout with auth context provider
- **`lib/auth/AuthContext.jsx`** - React context for auth state
- **`lib/auth/useAuth.js`** - Hook for using auth context
- **`lib/api/auth.js`** - HTTP client for backend auth

### Frontend Pages
- **`app/login/page.js`** - Login form
- **`app/register/page.js`** - Registration form with role selector
- **`app/properties/page.js`** - Property listing
- **`app/properties/[id]/page.js`** - Property detail
- **`app/upload/page.js`** - Property upload
- **`app/admin/approvals/page.js`** - Admin role approvals

### Frontend Components
- **`components/NavBar.jsx`** - Navigation
- **`components/PropertyCard.jsx`** - Property list item
- **`components/RoleSelector.jsx`** - Role dropdown
- **`components/guards/RequireAuth.jsx`** - Auth protection
- **`components/guards/RequireRole.jsx`** - Role protection

### Frontend Tests
- **`tests/components/`** - Component unit tests (7 files)
- **`tests/integration/`** - Integration tests (4 files)
- **`tests/lib/`** - Library tests (2 files)

---

## How to Build & Deploy

### Building for Production

#### Backend
```bash
cd casa-mx-backend

# Build TypeScript
npm run build

# Start production server
npm run start
# Or with environment: NODE_ENV=production npm run start
```

#### Frontend
```bash
cd casa-mx

# Build Next.js
npm run build

# Start production server
npm run start
# Runs on port 3000
```

### Docker Deployment

Create `Dockerfile` for backend:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "start"]
```

Create `Dockerfile` for frontend:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

---

## Troubleshooting

### Backend Won't Start
```bash
# Check PostgreSQL is running
docker ps

# If not running:
docker compose up -d

# Check database connection
PGPASSWORD=password psql -h localhost -U postgres -c "SELECT 1"

# Reset database
npx prisma migrate reset
```

### Tests Failing
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Reset test database
npx prisma migrate reset

# Run tests with verbose output
npm test -- --reporter=verbose
```

### Frontend Can't Connect to Backend
```bash
# Check backend is running
curl http://localhost:3001/health

# Check frontend environment variables
cat .env.local
# Should have NEXT_PUBLIC_API_URL=http://localhost:3001

# Check CORS settings
# In casa-mx-backend/src/app.ts
# origin should be http://localhost:3000
```

### Password Reset for Admin
```bash
# Connect to database
psql postgresql://user:password@localhost:5432/casa_mx

# Find admin user
SELECT id, email FROM "User" WHERE email = 'admin@casa-mx.com';

# Update password (requires hashing)
# Best practice: use app to register new admin account
```

---

## Summary

### What Was Built
A complete, production-ready property management platform with:
- Secure authentication and authorization
- Role-based access control with admin approval workflow
- Property listing and search functionality
- User request tracking system
- Analytics event tracking and reporting
- Comprehensive audit logging
- Full security hardening (rate limiting, CORS, input validation)

### Test Coverage
- **162 total tests** (133 backend + 29 frontend)
- **100% pass rate**
- Covers all major features and edge cases
- Security tests included
- Location filter tests included
- Environment-specific testing configuration

### Key Achievements
✅ Completed all 7 checkpoints
✅ Backend API fully functional
✅ Frontend fully integrated
✅ Security features implemented
✅ Comprehensive test coverage
✅ Production-ready code

### Next Steps (Optional)
- Deploy to cloud (AWS, Heroku, DigitalOcean)
- Set up CI/CD pipeline
- Add logging/monitoring (Datadog, LogRocket)
- Implement caching layer (Redis)
- Add more analytics features
- Expand property features

---

## Support & Documentation

### Quick Reference
- Backend API Docs: See API Documentation section above
- Frontend Components: Check component comments
- Database Schema: View `prisma/schema.prisma`
- Tests: Each test file has descriptive test names

### Running Everything

```bash
# Terminal 1: Start PostgreSQL (if not running)
docker compose up -d

# Terminal 2: Start backend
cd casa-mx-backend
npm run dev

# Terminal 3: Start frontend
cd casa-mx
npm run dev

# Terminal 4: Run tests (requires backend running)
# Backend tests
cd casa-mx-backend && npm test

# Frontend tests
cd casa-mx && npm test -- --run

# All tests together
cd casa-mx && .\run-all-tests.ps1
```

---

## 🏗️ CASA MX - Complete Master Rebuild Prompt

**Date**: March 10, 2026  
**Project**: Casa MX Rental Property Management Platform  
**Status**: Complete Rebuild from Scratch  
**Memory Sections**: 9

### Mission Statement

Rebuild Casa MX from scratch with the same stack, prioritizing:

1. Complete API integration (no mock fallbacks)
2. Proper error handling and recovery
3. Database health checks and resilience
4. All identified bugs fixed
5. Production-ready code and full test coverage

### Section 1: Technology Stack (Locked)

**Backend**
- Node.js 18+ LTS
- TypeScript 5.5.4
- Fastify 4.28.1
- Prisma 5.19.0
- PostgreSQL 16 (Docker)
- Zod, JWT (`@fastify/jwt`), bcrypt, rate limiting, CORS
- Pino + pino-pretty
- Vitest

**Frontend**
- Next.js 13.5.11 (App Router)
- React 18.2.0 + JavaScript/JSX
- Tailwind CSS (dark mode)
- Fetch/Axios
- React Hook Form + Zod
- React Context + custom hooks
- Playwright

**Infrastructure**
- Docker + Docker Compose
- postgres:16-alpine for local DB
- npm 9+

### Section 2: Database Schema (Complete)

Required models and relationships:
- `User`
- `Role`
- `UserRole` (unique constraint on `userId + roleId`, approval workflow)
- `Property` (sale + rental fields)
- `RentalApplication` (26 fields)
- `Request`
- `AnalyticsEvent`
- `AuditLog` (immutable)

### Section 3: API Endpoints (40+)

Required endpoint groups:
- Authentication: register/login/me/refresh/logout
- Properties: list/create/get by id
- Applications: submit/list/list by property/update status
- Admin: pending roles/approve/deny/users/audit logs
- Analytics: event ingestion + admin reports
- Health: `GET /health` with DB connectivity status

### Section 4: Frontend Structure

Critical pages:
- `/`, `/login`, `/register`, `/properties`, `/properties/:id`
- `/dashboard/applications`
- `/admin/approvals`

Key components:
- `NavBar`, `PropertyCard`, `PropertyList`
- `RentalApplicationForm`, `ApplicationsTable`, `ApproveRejectModal`
- App-level error boundary and recovery paths

### Execution Note

This section is the active rebuild spec and should be used as implementation criteria for future milestone work.

---

**Project Status**: ✅ COMPLETE & PRODUCTION READY
**Date Completed**: January 14, 2026
**Last Updated**: March 10, 2026
**Test Results**: 299/299 passing (214 backend + 53 frontend + 32 E2E)
**Time Investment**: Phase 1, Phase 2, Phase 4 Backend - Full Development Cycle

*This document is the complete source of truth for the Casa MX project. Share this with any team member who needs to understand the full project scope and implementation.*

---

## End-of-Day Handoff (March 9, 2026)

### Completed Today
- Closed remaining backend checkpoint regressions tied to role seeding and rental integrity behaviors.
- Added shared backend test setup to guarantee required baseline roles and seeded users in test runs.
- Confirmed request-flow migration and related frontend integration tests remain green.

### Verified Test Runs
- Full backend suite: 214/214 passing.
- Full frontend suite: 53/53 passing.

### Resume Plan for Tomorrow
1. Continue from master prompt post-validation tasks.
2. Execute any remaining E2E/manual acceptance checks required for final closeout.
3. Finalize documentation sync across all checkpoint and completion files.

---

## Continuation Session (March 10, 2026)

### Objective Executed
Continue master prompt from saved handoff and run remaining acceptance validation.

### Validation Outcomes
- Playwright E2E (`npm run test:e2e`): 32 passed, 0 skipped, 0 failed.
- Frontend tests (`npm test -- --run`): 53 passed, 0 skipped, 0 failed.

### Key Adjustments Made
- Removed stale mock dependency in frontend property detail query path.
- Hardened E2E tests for auth redirect timing and Spanish-language auth button labels.
- Fixed auth-link contrast class on login/register for accessibility checks.
- Added safer null-return behavior for invalid property detail lookups.

### Ready Next
Proceed to the next master-prompt implementation block from this validated baseline.

---

## Continuation Session (March 10, 2026 - Block 3)

### Phase 4 Gap Closed
Implemented missing Users endpoints from the Phase 4 endpoint matrix:

- `GET /users/me`
- `PATCH /users/me`
- `GET /users/:id`

Security behavior:
- JWT required on all users routes.
- `GET /users/:id` allows self-access and admin-access; rejects other cross-user access.
- Validation for patch payload and user-id params via Zod.

### Validation
- New test file added for users routes and executed successfully.
- Focused regression run (`checkpoint2`, `checkpoint3`, `users`) result: 35/35 passing.

---

## Continuation Session (March 10, 2026 - Block 4)

### Frontend API Migration Completed
`lib/api/users.js` now uses backend APIs instead of localStorage mocks.

Integrated backend endpoints:
- `GET /admin/pending-roles`
- `POST /admin/roles/:userRoleId/approve`
- `POST /admin/roles/:userRoleId/deny`
- `GET /users/me`
- `GET /users/:id`
- `PATCH /users/me`

### Validation
- Full frontend test suite executed after migration: 53/53 passing.
