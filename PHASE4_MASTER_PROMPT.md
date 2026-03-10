# PHASE 4 MASTER PROMPT — CASA MX BACKEND & FRONTEND MIGRATION

**Date**: January 13, 2026  
**Status**: 📋 Ready to Execute  
**Prerequisites**: Phase 3 Complete ✅

---

## ROLE & EXPECTATIONS

You are a **senior full-stack engineer** executing Phase 4 of CASA MX.

Your responsibility is to:

* Build a **production-grade backend** as the system of record
* Migrate frontend logic to consume real APIs
* Preserve all Phase 1–3 functionality
* Enforce **server-side security, authorization, and auditing**
* Work **incrementally by checkpoints**
* **Do not proceed to the next checkpoint until all tests pass**

No paid services.  
No shortcuts.  
No frontend-trusted logic.  
Backend is the source of truth.

---

## TECHNOLOGY STACK (LOCKED)

### Backend

* **Node.js 18+ LTS + TypeScript**
* **Fastify** (performance, schema-first)
* **Prisma ORM**
* **PostgreSQL** (local dev via Docker)
* **JWT** (access + refresh tokens)
* **Zod** (runtime validation)
* **Vitest** (unit/integration tests)

### Frontend

* Existing **Next.js 13 App Router**
* React Query for API integration
* Existing auth context updated to API-backed auth

---

## CORE PRINCIPLES (NON-NEGOTIABLE)

1. Backend enforces **all permissions**
2. Frontend never infers authority
3. Admin actions are **audited**
4. Roles cannot be self-assigned
5. Tests define completion
6. No breaking Phase 1–3 UX

---

## CHECKPOINT-BASED EXECUTION PLAN

---

## ✅ CHECKPOINT 0 — Backend Bootstrap

### Deliverables

* Backend repo initialized (`casa-mx-backend/`)
* TypeScript configured
* Fastify server running
* Prisma connected to Postgres
* Health check endpoint

### Required Files

```
casa-mx-backend/
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── config/
│   │   └── env.ts
│   ├── plugins/
│   │   └── prisma.ts
│   └── routes/
│       └── health.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
│   └── health.test.ts
├── package.json
├── tsconfig.json
├── .env.example
└── docker-compose.yml
```

### API

* `GET /health → { status: "ok" }`

### Tests (Must Pass)

```bash
npm test
# ✓ Server boots without errors
# ✓ Health endpoint returns 200
# ✓ Prisma connects to database
```

**Exit Criteria**: All tests green, server runs on `http://localhost:3001`

---

## ✅ CHECKPOINT 1 — Database Models & Migrations

### Models (Minimum)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String   // bcrypt hash
  roles     UserRole[]
  createdAt DateTime @default(now())
}

model Role {
  id    String @id @default(uuid())
  name  String @unique // buyer, seller, wholesaler, admin
}

model UserRole {
  id        String   @id @default(uuid())
  userId    String
  roleId    String
  status    String   // pending, approved, denied
  user      User     @relation(fields: [userId], references: [id])
  role      Role     @relation(fields: [roleId], references: [id])
  createdAt DateTime @default(now())
  
  @@unique([userId, roleId])
}

model Property {
  id          String   @id @default(uuid())
  title       String
  description String?
  address     String
  price       Float
  lat         Float?
  lng         Float?
  status      String   // available, sold
  sellerId    String
  createdAt   DateTime @default(now())
}

model PropertyRequest {
  id         String   @id @default(uuid())
  propertyId String
  buyerId    String
  message    String?
  status     String   // pending, contacted
  createdAt  DateTime @default(now())
}

model AnalyticsEvent {
  id         String   @id @default(uuid())
  eventName  String
  userId     String?
  metadata   Json?
  createdAt  DateTime @default(now())
}

model AuditLog {
  id             String   @id @default(uuid())
  actorUserId    String
  targetUserId   String?
  action         String
  previousState  Json?
  newState       Json?
  createdAt      DateTime @default(now())
  
  @@index([actorUserId])
  @@index([createdAt])
}
```

### Rules

* Users can have multiple roles
* Roles have states: `pending | approved | denied`
* Admin role exists
* AuditLog is append-only (no updates/deletes)

### Tests

```bash
npm run prisma:migrate
npm test
# ✓ Prisma migrations apply cleanly
# ✓ Models enforce relations correctly
# ✓ Unique constraints work
```

**Exit Criteria**: Database schema deployed, seed data loads

---

## ✅ CHECKPOINT 2 — Authentication & Admin Bootstrap

### Authentication

* Email + password login
* Password hashing (bcrypt)
* JWT access token (15min expiry)
* Refresh token rotation (7d expiry)
* Session invalidation on logout

### Admin Bootstrap (MANDATORY)

* One admin user created via **Prisma seed**
* Admin role = `approved`
* No hardcoded credentials in code
* No frontend bypass possible

### API

**Auth Routes**:
* `POST /auth/register` - Create user with pending roles
* `POST /auth/login` - Return JWT tokens
* `POST /auth/refresh` - Rotate tokens
* `POST /auth/logout` - Invalidate refresh token

**User Routes**:
* `GET /auth/me` - Get current user (requires JWT)

### Example Seed (prisma/seed.ts)

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' }
  });

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@casamx.local' },
    update: {},
    create: {
      email: 'admin@casamx.local',
      name: 'Admin User',
      password: await bcrypt.hash('admin123', 10),
      roles: {
        create: {
          roleId: adminRole.id,
          status: 'approved'
        }
      }
    }
  });

  console.log({ admin });
}

main();
```

### Tests

```bash
npm test
# ✓ User can register (roles default to pending)
# ✓ Admin seed exists in database
# ✓ Login with valid credentials issues JWT
# ✓ Login with invalid credentials returns 401
# ✓ JWT contains userId and roles
# ✓ Refresh token works
# ✓ Logout invalidates refresh token
```

**Exit Criteria**: Can login as admin, JWT verified, refresh works

---

## ✅ CHECKPOINT 3 — Authorization & Guards

### Backend

* JWT verification middleware
* Role-based guards (`requireRole('admin')`)
* Admin-only routes enforced server-side
* Role approval impossible without admin role

### Implementation

```typescript
// plugins/auth.ts
export const verifyJWT = async (request, reply) => {
  const token = request.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  request.user = decoded;
};

// utils/guards.ts
export const requireRole = (role: string) => {
  return async (request, reply) => {
    if (!request.user?.roles?.includes(role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
  };
};
```

### API

* `GET /auth/me` - Get current user profile
* `GET /admin/pending-roles` - List pending role approvals (admin only)

### Tests

```bash
npm test
# ✓ Non-admin blocked from /admin/* routes (403)
# ✓ Admin access succeeds (200)
# ✓ Spoofed role in JWT fails signature verification
# ✓ Expired token rejected (401)
# ✓ Missing token rejected (401)
```

**Exit Criteria**: Authorization enforced, role spoofing impossible

---

## ✅ CHECKPOINT 4 — Admin Authority & Audit Logs

### Core Requirement

> "Easy way to approve or deny roles"

### Implementation

* Admin approves/denies roles via API
* Every action writes to `AuditLog`
* Audit logs are **immutable** (no DELETE)

### API

**Admin Routes**:
* `POST /admin/roles/:userRoleId/approve` - Approve pending role
* `POST /admin/roles/:userRoleId/deny` - Deny pending role
* `GET /admin/audit-logs` - Query audit logs (admin only)
* `GET /admin/users` - List all users with roles (admin only)

### Audit Log Structure

```typescript
{
  actorUserId: string,      // Admin who performed action
  targetUserId: string,     // User affected
  action: string,           // 'APPROVE_ROLE', 'DENY_ROLE'
  previousState: Json,      // { status: 'pending' }
  newState: Json,           // { status: 'approved' }
  timestamp: DateTime
}
```

### Service Layer Example

```typescript
// services/admin.service.ts
export class AdminService {
  async approveRole(adminId: string, userRoleId: string) {
    return await prisma.$transaction(async (tx) => {
      const userRole = await tx.userRole.findUnique({
        where: { id: userRoleId }
      });

      const updated = await tx.userRole.update({
        where: { id: userRoleId },
        data: { status: 'approved' }
      });

      await tx.auditLog.create({
        data: {
          actorUserId: adminId,
          targetUserId: userRole.userId,
          action: 'APPROVE_ROLE',
          previousState: { status: userRole.status },
          newState: { status: 'approved' }
        }
      });

      return updated;
    });
  }
}
```

### Tests

```bash
npm test
# ✓ Admin can approve pending role
# ✓ Admin can deny pending role
# ✓ Audit log created for approval
# ✓ Audit log created for denial
# ✓ Non-admin blocked from approval (403)
# ✓ Cannot approve already-approved role
# ✓ Audit logs queryable by admin
# ✓ Audit logs not deletable
```

**Exit Criteria**: Role approvals work, all actions audited

---

## ✅ CHECKPOINT 5 — Backend Analytics API

### Purpose

Replace frontend localStorage analytics with real persistence.

### API

**Analytics Routes**:
* `POST /analytics/events` - Ingest event (authenticated)
* `GET /admin/analytics/summary` - Get aggregated metrics (admin only)
* `GET /admin/analytics/events` - Query raw events (admin only)

### Event Schema (Zod)

```typescript
const AnalyticsEventSchema = z.object({
  eventName: z.string(),
  entityId: z.string().optional(),
  metadata: z.record(z.any()).optional()
});
```

### Rules

* Only admins can query analytics
* All events validated with Zod
* No PII leakage in aggregations
* Events retain userId from JWT

### Tests

```bash
npm test
# ✓ Authenticated user can post event
# ✓ Event persisted with userId from JWT
# ✓ Admin can query analytics summary
# ✓ Non-admin blocked from analytics queries (403)
# ✓ Invalid event schema rejected (400)
# ✓ Events aggregated correctly (by name, by user, by date)
```

**Exit Criteria**: Analytics persisted, admin dashboard ready for frontend

---

## ✅ CHECKPOINT 6 — Frontend Migration

### Tasks

1. **Replace Mock APIs** (`lib/api/*.js`):
   - `lib/api/auth.js` → Real HTTP calls
   - `lib/api/users.js` → Real HTTP calls
   - `lib/api/properties.js` → Real HTTP calls

2. **Update AuthContext** (`lib/auth/AuthContext.jsx`):
   - Use backend `/auth/login`, `/auth/register`
   - Store JWT in httpOnly cookie or secure localStorage
   - Implement token refresh logic

3. **Wire Admin Approvals**:
   - `app/admin/approvals/page.js` → Call `/admin/pending-roles`
   - Approval buttons → `POST /admin/roles/:id/approve`

4. **Switch Analytics Provider**:
   - `lib/analytics/providers/apiProvider.js` → POST to `/analytics/events`
   - Set `NEXT_PUBLIC_ANALYTICS_PROVIDER=api`

5. **React Query Hooks**:
   - Create `lib/queries/auth.js`, `lib/queries/admin.js`, `lib/queries/analytics.js`
   - Use `useQuery`, `useMutation` for API calls

### Environment Variables

Update `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ANALYTICS_PROVIDER=api
```

### Rules

* No UX regressions
* No breaking Phase 1–3 flows
* Maintain existing test structure
* Add HTTP error handling

### Tests

```bash
# Frontend tests
npm test
# ✓ All 29 existing tests still pass
# ✓ Auth flow works end-to-end
# ✓ Admin approvals reflect immediately
# ✓ Analytics events sent to backend
# ✓ Token refresh handled gracefully
# ✓ Offline/error states shown correctly
```

**Exit Criteria**: Frontend fully migrated, all tests pass, manual smoke test complete

---

## ✅ CHECKPOINT 7 — Hardening & Production Readiness

### Required

1. **Input Validation**:
   - All routes validate input with Zod
   - SQL injection impossible (Prisma handles this)
   - XSS prevention (sanitize outputs)

2. **Token Security**:
   - Access token expires (15min)
   - Refresh token rotates on use
   - Tokens invalidated on logout

3. **Error Handling**:
   - No stack traces in production
   - Structured error responses
   - Logging with sensitive data redacted

4. **Rate Limiting**:
   - Auth routes: 5 req/min per IP
   - API routes: 100 req/min per user

5. **CORS**:
   - Only allow frontend origin
   - Credentials allowed
   - Preflight handled

### Implementation

```typescript
// plugins/rateLimit.ts
import rateLimit from '@fastify/rate-limit';

export default async function (fastify) {
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  });
}

// app.ts
import cors from '@fastify/cors';

app.register(cors, {
  origin: process.env.FRONTEND_URL,
  credentials: true
});
```

### Tests

```bash
npm test
# ✓ Token expiry enforced
# ✓ Invalid payloads rejected with 400
# ✓ Rate limit returns 429
# ✓ CORS blocks unauthorized origins
# ✓ Error responses hide stack traces
# ✓ SQL injection attempts fail safely
```

**Exit Criteria**: Security audit passes, all edge cases handled

---

## SUCCESS CRITERIA (ALL REQUIRED)

Phase 4 is complete **only when**:

* ✅ Backend is system of record (no localStorage authority)
* ✅ Admin authority is real and auditable
* ✅ Frontend uses no mock data
* ✅ Phase 1–3 functionality intact (all tests pass)
* ✅ 100% checkpoints completed
* ✅ No paid dependencies
* ✅ All tests passing (backend + frontend)
* ✅ Manual smoke test passes:
  - [ ] Register new user
  - [ ] Login as admin
  - [ ] Approve/deny role
  - [ ] Check audit logs
  - [ ] View analytics dashboard
  - [ ] Create property
  - [ ] View map

---

## EXPLICITLY OUT OF SCOPE

These are **not** part of Phase 4:

* ❌ Payments
* ❌ Email sending
* ❌ Push notifications
* ❌ Search indexing
* ❌ Real-time sockets
* ❌ Image upload (use URLs)
* ❌ OAuth providers
* ❌ Advanced analytics (funnels, cohorts)
* ❌ Multi-tenancy
* ❌ Internationalization beyond existing Spanish UI

---

## FINAL INSTRUCTION TO AGENT

Proceed **checkpoint by checkpoint**.

### Execution Protocol

1. **Read checkpoint requirements**
2. **Write tests first** (TDD)
3. **Implement minimum code** to pass tests
4. **Run tests**: `npm test`
5. **If tests fail**: Fix before proceeding
6. **If tests pass**: Commit and move to next checkpoint

### Communication

After each checkpoint:
* Commit with message: `✅ CHECKPOINT X - [description]`
* Report status: "Checkpoint X complete, all tests pass"
* Ask: "Proceed to Checkpoint X+1?"

### Rules

* **Do not skip steps**
* **Do not invent features**
* **Do not weaken security**
* **If a checkpoint fails tests, stop and fix**

---

**Status**: 📋 Ready to Execute  
**Estimated Duration**: 10-12 working days  
**Next Action**: Create `casa-mx-backend/` repo and begin Checkpoint 0

---

**End of Phase 4 Master Prompt**

### Technology Stack (Non-Negotiable)

| Area       | Decision                                              | Rationale |
| ---------- | ----------------------------------------------------- | --------- |
| Runtime    | **Node.js 18+ (LTS)**                                 | Stability, ecosystem maturity |
| Framework  | **Fastify**                                           | Performance, schema-first, low overhead |
| Language   | **TypeScript**                                        | Type safety, IDE support, maintainability |
| Database   | **PostgreSQL**                                        | ACID compliance, JSON support, proven scale |
| ORM        | **Prisma**                                            | Type-safe queries, migrations, dev experience |
| Auth       | **JWT (access + refresh)**                            | Stateless, scalable, standard |
| Validation | **Zod**                                               | Type inference, composability, runtime safety |
| Logging    | **pino**                                              | High performance, structured logging |
| Testing    | **Vitest + Supertest**                                | Consistent with frontend, fast |
| Env        | `.env` + `.env.example`                               | Standard practice |

---

## Backend Repository Structure

```
casa-mx-backend/
├── src/
│   ├── app.ts                 # Fastify app bootstrap
│   ├── server.ts              # HTTP server start
│   │
│   ├── config/
│   │   ├── env.ts             # Env validation (Zod)
│   │   └── jwt.ts             # JWT config
│   │
│   ├── plugins/
│   │   ├── prisma.ts          # Prisma client plugin
│   │   ├── auth.ts            # JWT verification hook
│   │   └── rateLimit.ts       # Rate limiting
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schema.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.routes.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.schema.ts
│   │   │
│   │   ├── roles/
│   │   │   ├── roles.routes.ts
│   │   │   ├── roles.service.ts
│   │   │   └── roles.schema.ts
│   │   │
│   │   ├── properties/
│   │   │   ├── properties.routes.ts
│   │   │   ├── properties.service.ts
│   │   │   └── properties.schema.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── analytics.routes.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── analytics.schema.ts
│   │   │
│   │   └── admin/
│   │       ├── admin.routes.ts
│   │       └── admin.service.ts
│   │
│   ├── utils/
│   │   ├── errors.ts          # Typed HTTP errors
│   │   ├── permissions.ts     # RBAC helpers
│   │   └── audit.ts           # Admin audit logging
│   │
│   └── types/
│       └── fastify.d.ts       # Request.user typing
│
├── prisma/
│   ├── schema.prisma          # DB schema
│   └── migrations/
│
├── tests/
│   ├── auth.test.ts
│   ├── admin.test.ts
│   └── analytics.test.ts
│
├── .env.example
├── package.json
├── tsconfig.json
├── README.md
└── docker-compose.yml
```

---

## Core Backend Principles (Enforced)

### 1. Route = Schema + Auth + Service

Routes do **nothing** except:
- Validate input (Zod schemas)
- Enforce permissions (JWT + RBAC)
- Call service layer
- Return typed response

**Anti-pattern**: Business logic in routes  
**Correct**: Routes are thin adapters

### 2. Service Layer Owns Business Logic

- No DB access in routes
- No permission checks in Prisma layer
- Services compose operations atomically
- Services return typed results (success/error)

### 3. Admin Actions Are Audited

Every admin mutation logs:
```typescript
{
  adminId: string,
  action: string,
  entity: string,
  entityId: string,
  timestamp: Date
}
```

Audit logs are:
- Immutable
- Queryable by admin
- Never deleted

---

## Minimal Bootstrap Example

### `src/app.ts`

```typescript
import Fastify from 'fastify';
import { env } from './config/env';
import prismaPlugin from './plugins/prisma';
import authPlugin from './plugins/auth';

export function buildApp() {
  const app = Fastify({ 
    logger: {
      level: env.LOG_LEVEL || 'info'
    }
  });

  // Register plugins
  app.register(prismaPlugin);
  app.register(authPlugin);

  // Register routes
  app.register(import('./modules/auth/auth.routes'), { prefix: '/auth' });
  app.register(import('./modules/users/users.routes'), { prefix: '/users' });
  app.register(import('./modules/admin/admin.routes'), { prefix: '/admin' });
  app.register(import('./modules/analytics/analytics.routes'), { prefix: '/analytics' });
  app.register(import('./modules/properties/properties.routes'), { prefix: '/properties' });

  // Health check
  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}
```

### `src/server.ts`

```typescript
import { buildApp } from './app';
import { env } from './config/env';

const app = buildApp();

const start = async () => {
  try {
    await app.listen({ 
      port: env.PORT, 
      host: '0.0.0.0' 
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

### `src/config/env.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
```

---

## Prisma Schema (Initial)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String?  // bcrypt hash (null for OAuth users)
  roles     Role[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}

model Role {
  id        String   @id @default(uuid())
  type      String   // buyer, seller, wholesaler, admin
  status    String   // pending, approved, rejected
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([status])
}

model Property {
  id          String   @id @default(uuid())
  title       String
  description String?
  address     String
  price       Float
  bedrooms    Int?
  bathrooms   Float?
  area        Float?
  type        String   // house, apartment, land, commercial
  status      String   // available, sold, pending
  lat         Float?
  lng         Float?
  images      String[] // Array of image URLs
  sellerId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([sellerId])
  @@index([status])
  @@index([type])
}

model AnalyticsEvent {
  id        String   @id @default(uuid())
  eventName String
  userId    String?
  activeRole String?
  entityId  String?
  metadata  Json?
  createdAt DateTime @default(now())

  @@index([eventName])
  @@index([userId])
  @@index([createdAt])
}

model AuditLog {
  id        String   @id @default(uuid())
  adminId   String
  action    String   // approve_role, reject_role, delete_property, etc.
  entity    String   // User, Role, Property
  entityId  String
  metadata  Json?
  createdAt DateTime @default(now())

  @@index([adminId])
  @@index([action])
  @@index([createdAt])
}
```

---

## Example Route + Service Pattern

### `src/modules/auth/auth.routes.ts`

```typescript
import { FastifyPluginAsync } from 'fastify';
import { loginSchema, registerSchema } from './auth.schema';
import { AuthService } from './auth.service';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authService = new AuthService(fastify.prisma);

  fastify.post('/login', {
    schema: {
      body: loginSchema,
    }
  }, async (request, reply) => {
    const result = await authService.login(request.body);
    return result;
  });

  fastify.post('/register', {
    schema: {
      body: registerSchema,
    }
  }, async (request, reply) => {
    const result = await authService.register(request.body);
    return result;
  });
};

export default authRoutes;
```

### `src/modules/auth/auth.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateTokens } from '../../config/jwt';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async login(data: { email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { roles: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const role = user.roles.find(r => r.type === data.role && r.status === 'approved');
    if (!role) {
      throw new Error('Role not approved');
    }

    const tokens = generateTokens({ userId: user.id, role: role.type });
    return { user, tokens };
  }

  async register(data: { name: string; email: string; roles: string[] }) {
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        roles: {
          create: data.roles.map(type => ({
            type,
            status: 'pending'
          }))
        }
      },
      include: { roles: true }
    });

    return { user };
  }
}
```

---

## PART 2 — PHASE 4 EXECUTION PROMPT

### 🚨 ROLE

You are a **senior backend architect and implementer**.

Your job is to implement **Phase 4** for CASA MX.

Frontend is **already complete and stable** (Phase 1-3 done).  
You must **not break existing UX**.

---

### 🎯 OBJECTIVE

Migrate CASA MX from a frontend-only system to a **backend-authoritative production system**.

**Current State**: All data in localStorage, mock APIs  
**Target State**: PostgreSQL database, real APIs, JWT auth, server-side permissions

---

### ⚠️ NON-NEGOTIABLE RULES

1. **Backend is the single source of truth**
   - Database state overrides localStorage
   - Frontend is cache + optimistic UI only

2. **localStorage is cache only**
   - Used for offline UX and performance
   - Always sync from backend on mount
   - Clear cache on auth state change

3. **All admin actions are audited**
   - Every mutation tracked in `AuditLog`
   - Immutable, queryable by admins
   - Never deleted

4. **All permissions enforced server-side**
   - JWT verification on protected routes
   - RBAC checks in service layer
   - No client-side permission trust

5. **All APIs are typed, validated, and tested**
   - Zod schemas for all inputs
   - TypeScript end-to-end
   - 80%+ test coverage required

6. **No frontend feature expansion**
   - Phase 4 is **backend migration only**
   - No new UI features
   - Maintain exact same UX

7. **Zero breaking changes to Phase 1–3 UI**
   - All existing pages must work
   - All existing tests must pass
   - No visual changes

---

### 📋 REQUIRED DELIVERABLES

#### 1. Backend Service

**Setup**:
- Fastify + TypeScript
- Prisma + PostgreSQL
- Docker Compose for local dev
- Environment validation (Zod)

**Structure**:
- Modular architecture (see folder structure above)
- Plugin system (Prisma, Auth, Rate Limiting)
- Centralized error handling
- Structured logging (pino)

#### 2. API Endpoints

You **must** implement:

**Auth** (`/auth`):
- `POST /auth/login` - Login with email + role
- `POST /auth/register` - Create account with roles
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Invalidate refresh token

**Users** (`/users`):
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update profile
- `GET /users/:id` - Get user by ID (admin only)

**Admin** (`/admin`):
- `GET /admin/pending-approvals` - List pending role approvals
- `POST /admin/roles/approve` - Approve role
- `POST /admin/roles/reject` - Reject role
- `GET /admin/audit-logs` - Query audit logs
- `GET /admin/users` - List all users

**Analytics** (`/analytics`):
- `POST /analytics/events` - Ingest event
- `GET /admin/analytics/summary` - Aggregate metrics (admin only)
- `GET /admin/analytics/events` - Query events (admin only)

**Properties** (`/properties`):
- `GET /properties` - List properties (with filters)
- `GET /properties/:id` - Get property details
- `POST /properties` - Create property (seller/admin only)
- `PATCH /properties/:id` - Update property (owner/admin only)
- `DELETE /properties/:id` - Delete property (owner/admin only)
- `GET /properties/map` - Get properties with coordinates

#### 3. Frontend Migration

**Replace** `lib/api/*` with real HTTP implementations:

```typescript
// Before (mock):
export async function getProperties() {
  return getItem('properties') || [];
}

// After (real):
export async function getProperties() {
  const response = await fetch(`${API_URL}/properties`, {
    headers: {
      'Authorization': `Bearer ${getAccessToken()}`
    }
  });
  return response.json();
}
```

**Requirements**:
- Maintain existing function signatures
- Add auth token handling
- Handle network errors gracefully
- Show loading states
- Cache responses in localStorage (TTL: 5min)

#### 4. Testing Requirements

**Backend Tests** (Vitest + Supertest):
- Unit tests for services
- Integration tests for routes
- Auth flow tests (login, refresh, logout)
- Admin permission tests
- Analytics ingestion tests
- RBAC enforcement tests

**Frontend Tests** (existing + additions):
- All Phase 1-3 tests must pass
- Add HTTP error handling tests
- Add token refresh tests
- Add offline UX tests

**CI Requirements**:
```bash
# Backend
npm test
npm run build
npm run typecheck

# Frontend (must still pass)
npm test
npm run build
```

---

### ✅ SUCCESS CRITERIA

Phase 4 is complete **only when**:

1. **Admin approvals cannot be faked client-side**
   - Trying to set role status in localStorage has no effect
   - Role status fetched from backend on page load

2. **Analytics dashboard reflects backend data**
   - Events ingested via API
   - Dashboard queries backend, not localStorage

3. **Role approval persists across browsers**
   - Approve role in Chrome → appears approved in Firefox
   - Test with incognito + different machines

4. **Tokens expire and refresh correctly**
   - Access token expires after 15min → auto-refresh
   - Refresh token expires after 7d → redirect to login

5. **Audit logs exist for every admin action**
   - Approve role → audit log created
   - Query logs via `/admin/audit-logs`

6. **All Phase 1-3 tests pass**
   - No regressions
   - All 29 unit tests passing
   - E2E tests pass (or are updated if API contract changes)

---

### 🚫 OUT OF SCOPE (DO NOT IMPLEMENT)

These are **explicitly excluded** from Phase 4:

- New UI features
- Favorites/bookmarks
- Saved searches
- Real-time notifications
- Email verification
- OAuth (Google/Facebook login)
- Payment processing
- Image upload/storage (use URLs for now)
- Advanced search filters (defer to Phase 5)
- WebSockets/real-time updates
- Mobile app

**If tempted to add these**: Stop. File in backlog for Phase 5.

---

### 📅 INCREMENTAL EXECUTION PLAN

Proceed in **this exact order**:

#### Step 1: Backend Bootstrap (Day 1)
- [ ] Create `casa-mx-backend` repository
- [ ] Setup TypeScript + Fastify
- [ ] Configure Docker Compose (Postgres)
- [ ] Setup Prisma
- [ ] Create initial schema
- [ ] Run first migration
- [ ] Health check endpoint works

#### Step 2: Auth + JWT (Day 2-3)
- [ ] Implement JWT plugin
- [ ] `/auth/login` endpoint
- [ ] `/auth/register` endpoint
- [ ] `/auth/refresh` endpoint
- [ ] Test auth flow end-to-end

#### Step 3: Admin Authority (Day 4-5)
- [ ] Admin routes (`/admin/pending-approvals`)
- [ ] Role approval logic
- [ ] Audit logging implementation
- [ ] Permission middleware
- [ ] Test admin RBAC

#### Step 4: Analytics Ingestion (Day 6)
- [ ] `POST /analytics/events`
- [ ] Event storage (Prisma)
- [ ] `GET /admin/analytics/summary`
- [ ] Test event ingestion

#### Step 5: Frontend Migration (Day 7-8)
- [ ] Update `lib/api/auth.js` → real API
- [ ] Update `lib/api/users.js` → real API
- [ ] Add token refresh logic
- [ ] Update analytics provider → API
- [ ] Test all flows in browser

#### Step 6: Hardening & Tests (Day 9-10)
- [ ] Add rate limiting
- [ ] Add CORS config
- [ ] Add error handling
- [ ] Write integration tests
- [ ] Run full test suite
- [ ] Load test with k6
- [ ] Security audit (helmet, etc.)

---

### 🔧 ENVIRONMENT VARIABLES

**Backend** (`.env.example`):
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/casamx
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (update `.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ANALYTICS_PROVIDER=api
```

---

### 📚 REFERENCE DOCS

- [Fastify Documentation](https://www.fastify.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

### 🎯 FINAL INSTRUCTION

Proceed **incrementally**.

Do **not** skip steps.

After each step:
1. Commit working code
2. Run tests
3. Document what was done
4. Get approval before next step

**Communication protocol**:
- Daily status update (what's done, what's next, blockers)
- Ask before making architectural changes
- Flag security concerns immediately

---

## Checklist for Handoff

Before starting Phase 4, verify:

- [ ] Phase 3 complete (29 tests passing)
- [ ] PostgreSQL installed locally (or Docker ready)
- [ ] Node.js 18+ installed
- [ ] Frontend still runs on `localhost:3000`
- [ ] No uncommitted changes in frontend repo

**Questions before proceeding?** Document them in `PHASE4_QUESTIONS.md`.

---

**Status**: 📋 Ready to Execute  
**Owner**: Backend Team / AI Agent  
**Start Date**: TBD  
**Target Completion**: 10 days

---

**End of Phase 4 Master Prompt**
