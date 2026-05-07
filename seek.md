# CASA MX — Knowledge Reference

> Last updated: 2026-05-07  
> This file is the source of truth about this codebase.  
> OpenCode reads this first before any task.

---

## Behavioral Rules

1. **Read before coding** — read every involved file first. Check how similar features are built. If something is unclear, stop and ask. Never assume the structure, verify it first.

2. **Simplicity first** — fewer lines always wins. No premature abstractions. No over-engineering. No 12 file solution for a 2 line problem. If a junior dev can't read it, rewrite it.

3. **Surgical changes only** — edit what's broken, nothing else. No rewriting entire files to fix one function. No touching imports you weren't asked about. Small diffs always.

4. **Goal-driven execution** — ask *why* before writing *how*. If the task is unclear, stop and ask. Don't build what you think I want — build what I actually ask for.

---

## Tech Stack

### Frontend: `CASA-MX` → Vercel (`casa-mx.com`)
| Tech | Version | Purpose |
|---|---|---|
| Next.js | 15.5.14 | Framework, App Router |
| React | 18.2 | UI library |
| Tailwind CSS | 3.4.8 | Styling, `class` dark mode |
| react-hook-form | 7.45 | Form management (login, register, contact request) |
| zod | 3.23 | Validation schemas |
| @tanstack/react-query | 4.35 | Server state / caching |
| Leaflet | 1.9.4 | Maps |
| Stripe.js | 9.2 | Payments |
| lucide-react | 1.7 | Icons |
| recharts | 3.6 | Charts |
| Vitest | 1.6.1 | Unit/integration tests |
| Playwright | 1.41+ | E2E tests |
| @testing-library/react | 14 | Component testing |

### Backend: `casa-mx-backend` → Railway
| Tech | Version | Purpose |
|---|---|---|
| Node.js | 18-20 | Runtime |
| TypeScript | 5.5 | Language |
| Fastify | 5.8 | Web framework |
| Prisma | 5.19 | ORM + migrations |
| PostgreSQL | 16 | Database |
| Redis | 7 | Caching (ioredis) |
| JWT | 9.0 | Auth tokens |
| bcrypt | 6.0 | Password hashing |
| Stripe | 22.0 | Payments/subscriptions |
| AWS S3 | client 3.10 | Document uploads |
| SendGrid | 8.1 | Email |
| pdfkit | 0.18 | Contract PDFs |
| zod | 3.23 | API validation |

### Infrastructure
- **Frontend** → Vercel (connected to Namecheap domain `casa-mx.com`)
- **Backend** → Railway Docker (PostgreSQL 16 + Redis 7)
- **CI** → GitHub Actions: `CI` (test+build), `Security Scan` (gitleaks + npm audit), `Playwright E2E`
- **Git** → GitHub (`AyyJayyC/CASA-MX`, `AyyJayyC/casa-mx-backend`)
- **Authentication** → httpOnly cookies + `credentials: 'include'` pattern (no auth headers)

---

## Project Architecture

### Frontend (`/mnt/c/Users/axelj/casa-mx/`)

```
app/                    # Next.js App Router pages
  dashboard/            # Role-filtered dashboard hub + sub-pages
    contact-requests/   # Seller's incoming contact requests (Phase 1)
    offers/             # Seller's received purchase offers
    my-offers/          # Buyer's sent purchase offers
    applications/       # Landlord's rental applications
    rental-applications/# Tenant's submitted applications
  properties/           # Property listing + [id] detail
  login/                # Login with role selection screen
  register/             # Registration
  requested/            # Buyer's contact requests list
  settings/             # User profile + documents

components/
  NavBar.jsx            # Shell (222L) — imports DesktopNavLinks + MobileMenu
  DesktopNavLinks.jsx   # Desktop nav + properties dropdown (Phase 3)
  MobileMenu.jsx        # Mobile hamburger menu (Phase 3)
  ApplicationsTable.jsx # Rental applications list (388L, split Phase 3)
  ApplicationDetailsModal.jsx  # Extracted from ApplicationsTable (Phase 3)
  ApplicantReviewSummary.jsx   # Extracted from ApplicationsTable (Phase 3)
  OfferRespondModal.jsx # Shared offer respond form (Phase 3)
  MakeOfferModal.jsx    # Purchase offer submission
  ContactRequestModal.jsx  # Address request modal (Phase 1)
  ContactRequestForm.jsx   # Simplified 3-field form (Phase 1)
  ContactRequestsList.jsx  # Buyer's request list with address reveal (Phase 1)
  SellerContactRequests.jsx  # Seller dashboard for incoming requests (Phase 1)
  LeaveReviewModal.jsx     # Simplified review form (Phase 2)
  ReviewList.jsx           # Review cards (Phase 2)
  ReviewSummaryCard.jsx    # Review summary (Phase 2)
  NegotiationPanel.jsx     # Rent negotiation, uses useAuth() (Phase 4)

lib/
  api/                  # Backend API wrappers (13 files)
  auth/                 # AuthContext, CreditsContext, useAuth hook
  constants/            # financing.js (centralized FINANCING options, Phase 3)
  queries/              # React Query hooks
  validation/           # Zod schemas (contactRequestSchema.js, propertySchema.js)
  reviews.js            # REVIEW_ROLE_LABELS (all 6 roles), helper functions

public/brand/           # logo-primary.svg, logo-mark.svg, favicon.ico
```

### Backend (`/mnt/c/Users/axelj/casa-mx-backend/`)

```
prisma/
  schema.prisma         # 23 models: User, Role, Property, PropertyRequest,
                        # RentalApplication, Review, PropertyOffer, Negotiation,
                        # NegotiationOffer, CreditBalance, CreditTransaction,
                        # CreditPackage, UserSubscription, + debug/log models

src/
  routes/               # 22 route files (requests, offers, negotiations,
                        # reviews, properties, credits, auth, debug, etc.)
  services/             # credits.service.ts, reviews.service.ts, auth.service.ts,
                        # cache.service.ts, maps.service.ts, email.service.ts, etc.
  schemas/              # Zod validation schemas per route
  utils/                # guards.ts (auth middleware), errorHandling.ts, badges.ts
  config/               # env.ts (environment validation)
  plugins/              # jwt.ts, prisma.ts, logging.ts, mapsMonitor.ts
```

---

## Key Patterns

### Auth
- JWT stored in httpOnly cookies (not localStorage)
- All API calls use `credentials: 'include'` to send cookies
- `useAuth()` hook wraps `AuthContext` — provides `login`, `logout`, `switchRole`, `user`
- `getRoleLabel()` maps role IDs to Spanish labels (Vendedor, Comprador, etc.)
- `activeRole` on user object controls dashboard visibility
- Login page shows role picker if user has 2+ approved roles (Phase 5 UX)

### API Calls
- All API files use `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'`
- `credentials: 'include'` on every fetch
- `parseResponse()` pattern: check `res.ok` first, then throw with server error
- Files with `parseResponse`: applications, offers, requests, reviews, subscriptions, negotiations, notifications

### Forms
- `react-hook-form` + `zod`: login, register, ContactRequestForm
- Manual `useState`: MakeOfferModal, LeaveReviewModal, RentalApplicationForm

### Credit System
- 1 credit = 1 MXN contact unlock
- `CreditBalance`: per-user balance, `CreditTransaction`: purchase/spend/refund
- `CreditPackage`: purchasable bundles with Stripe Price IDs
- `UserSubscription`: tracks subscription status (active/trialing/canceled)
- Subscription bypass NOT yet implemented (model exists on cleanup branch, not deployed to main)

### Guards
- `RequireAuth`: redirects unauthenticated to /login
- `RequireRole`: checks user has specific approved role
- Settings page uses `RequireAuth` wrapper (fixed redirect loop in Phase 5)

---

## Recent Changes Summary

### Phase 1 — Contact/Address Request System
- Simplified request form: 3 fields (name, phone, message)
- Added `GET /requests/seller` + `POST /requests/:id/approve` endpoints
- Address revealed to buyer only on seller approval
- Seller credit-gated contact unlock
- Fixed hardcoded `BACKEND_URL` + `buyerId: 'buyer-demo'` fallback

### Phase 2 — Review + Offer Simplification
- Dropped `ReviewCategoryScore` model — reviews are single rating + comment
- Removed dead `OfferNegotiationTimeline` component (backend model doesn't exist on main)
- Removed dead `getOfferThread` API function
- Removed "2 counter-offer required to reject" lock from NegotiationPanel

### Phase 3 — Dedup + Refactor
- Extracted `OfferRespondModal` (shared by seller/buyer offer pages, -250 lines)
- Centralized `FINANCING_LABELS/OPTIONS/ICONS` into `lib/constants/financing.js`
- Split `ApplicationsTable` (686→388L): extracted `ApplicationDetailsModal` + `ApplicantReviewSummary`
- Split `NavBar` (747→222L): extracted `DesktopNavLinks` (90L) + `MobileMenu` (107L)
- Deleted orphan `/terms` page, redirects to `/terminos`

### Phase 4 — Code Quality
- Standardized `parseResponse` in `negotiations.js` and `notifications.js`
- Fixed `NegotiationPanel` to use `useAuth()` instead of `useContext(AuthContext)`

### Phase 5 — UX Polish
- Dashboard now filters by `activeRole` (not all approved roles)
- Login page: role selection screen when user has 2+ roles
- Settings page: wrapped in `RequireAuth` (fixes redirect loop bug)
- NavBar settings: SVG gear icon replaced emoji (alignment fix)
- Logo: heart centered in `logo-primary.svg` and `logo-mark.svg` (shifted left 3-35px)
- E2E workflow: added backend service, changed trigger to `push: [main]`
- Security: added `.gitleaks.toml`, fixed high-severity npm vulns

---

## Testing

### Frontend
- 25 test files, 69 unit tests (Vitest)
- Command: `npm test -- --run`
- E2E: 6 Playwright test files (a11y, map, production-smoke, publish-upload-live, rental-flow, integrity)
- E2E auto-starts on push to main (requires backend service in CI)

### Backend
- Vitest with real PostgreSQL test database (`casamx_test`)
- Command: `npm run test`
- Slow tests due to DB integration — use GitHub CI for full suite

---

## Common Issues & Fixes

| Problem | Fix |
|---|---|
| NavBar test fails with `React is not defined` | Extracted components need `import React from 'react'` (Next.js JSX transform doesn't require it but vitest+jsdom does) |
| Settings button redirect loop | Wrap page content in `<RequireAuth>` instead of manual `isUnauthorized` check |
| Security scan fails | Run `npm audit fix --omit=dev` for high vulns; add `.gitleaks.toml` for false positives |
| E2E fails with backend unavailable | Add PostgreSQL service + backend clone + migration steps to E2E workflow |
| WSL npm operations fail | Use `sudo` for `rm -rf node_modules` if permissions break; prefer Git Bash for npm operations |
| `main` branch protected (backend) | Push to feature branch, create PR, let CI pass, merge |
| HTTPS push fails without credentials | Use `https://TOKEN@github.com/...` as remote URL, or configure credential helper |

---

## Prisma Models (Active on main)

23 models total:
`User`, `Role`, `UserRole`, `Property`, `PropertyDocument`, `UserDocument`,
`PropertyRequest` (has `name`, `phone` added in Phase 1),
`RentalApplication`, `Review` (no `categoryScores` relation, removed Phase 2),
`Notification`, `AnalyticsEvent`, `AuditLog`,
`DebugSession`, `ActionLog`, `ErrorLog`, `ApiLog`,
`ApiUsageLog`, `UsageLimit`, `LimitAlert`,
`CreditBalance`, `CreditTransaction`, `CreditPackage`, `UserSubscription`,
`Negotiation`, `NegotiationOffer`, `PropertyOffer`

Not on main: `ReviewCategoryScore` (dropped Phase 2), `PropertyOfferEvent` (never deployed)

---

## Security Audit Findings (2026-05-07)

### Critical (Must Fix Before Launch)

| ID | Category | File:Line | Issue |
|----|----------|-----------|-------|
| VULN-01 | JWT Exposure | `backend/src/routes/auth.ts:117-132` | Tokens returned in JSON response body (login, refresh, OAuth). Defeats httpOnly cookies. Any XSS can steal tokens. |
| VULN-02 | PII Leakage | `backend/prisma/schema.prisma:376-378` | `ApiLog` stores raw `requestBody`/`responseBody` — captures passwords, tokens, all PII in plaintext |
| VULN-03 | Secrets | `casa-mx/.gitleaks.toml:32` | `.env.local` in gitleaks path allowlist — secrets committed to this file will NEVER be flagged |
| VULN-04 | No Password Reset | `backend/src/routes/auth.ts` | No `/auth/forgot-password` or `/auth/reset-password`. Users permanently locked out if password forgotten |
| VULN-05 | No CSRF | All backend routes | Zero anti-CSRF protection. Relies solely on SameSite=Lax. State-changing POST/PATCH/DELETE unprotected |
| VULN-06 | Secrets on Disk | `backend/.env` | Live AWS IAM, Stripe, SendGrid, Google OAuth keys. Rotate immediately |

### High

| ID | Category | File:Line | Issue |
|----|----------|-----------|-------|
| VULN-07 | Stored XSS | `casa-mx/components/map/createMarker.js:33` | `innerHTML` with unescaped `property.title` and `property.address` — no max length or sanitization |
| VULN-08 | Type Bypass | `backend/src/routes/applications.ts:87` | `(input as any).offeredMonthlyRent` bypasses Zod validation |
| VULN-09 | Type Bypass | `backend/src/routes/properties.ts:301,523` | `(input as any).financeOptions` bypasses Zod validation |
| VULN-10 | No Account Lockout | `backend/src/services/auth.service.ts` | No lockout after repeated login failures. Brute-force via rate limit only |
| VULN-11 | No MFA | — | Multi-factor authentication not implemented |
| VULN-12 | Logout Broken | `backend/src/routes/auth.ts:270-271` | `clearCookie` lacks `secure` flag — cookies may not clear in production |
| VULN-13 | CSP Disabled | `backend/src/app.ts:108` | `contentSecurityPolicy: false` — no CSP header sent |
| VULN-14 | Docker Root | `backend/Dockerfile:1-36` | No `USER` directive — container runs as root |
| VULN-15 | Exposed DB | `backend/docker-compose.yml:7` | PostgreSQL port 5432 exposed to `0.0.0.0` |
| VULN-16 | Exposed Redis | `backend/docker-compose.yml:25` | Redis port 6379 exposed with no password |
| VULN-17 | Hardcoded DB Creds | `backend/docker-compose.yml:9-10,46` | `postgres:postgres` in committed file |
| VULN-18 | Debug PII | `backend/prisma/schema.prisma:289-392` | DebugSession/ActionLog/ErrorLog store userEmail, ipAddress, raw body in plaintext |

### Medium

| ID | Category | File:Line | Issue |
|----|----------|-----------|-------|
| VULN-19 | User Enum | `backend/src/routes/auth.ts:62` | Registration returns "Email already exists" |
| VULN-20 | Missing max Length | All Zod schemas | No `.max()` on name, title, address, description, etc. — DoS risk |
| VULN-21 | No Upper Bounds | Property/Application schemas | `monthlyIncome`, `price`, `bedrooms` have no max — overflow risk |
| VULN-22 | Weak Passwords | `backend/src/schemas/auth.ts:8` | Only `min(8)`, no complexity requirements |
| VULN-23 | OAuth Audience Skip | `backend/src/routes/auth.ts:362` | Audience check skipped if `GOOGLE_CLIENT_ID` not set |
| VULN-24 | Timestamp Disclose | `backend/src/routes/health.ts:17-18` | Health endpoint reveals `NODE_ENV` and `uptime` |
| VULN-25 | E2E Repo Clone | `casa-mx/.github/workflows/e2e.yml:34` | E2E pipeline clones backend repo — supply chain risk |

### Positive Findings
- Passwords bcrypt-hashed (cost 10) ✅
- JWT algorithm pinned to HS256, no `alg:none` possible ✅
- CORS uses origin whitelist, no wildcard with credentials ✅
- All API calls use `credentials: 'include'` (httpOnly cookie auth) ✅
- No `eval()`, `new Function()`, or `dangerouslySetInnerHTML` in React code ✅
- Rate limiting on login (10/15min) and register (5/15min) ✅
- Refresh token rotation with JTI revocation ✅
- Prisma parameterized queries throughout (no raw SQL injection) ✅
- `.env` files in `.gitignore` — not tracked in git ✅
- Security scan in CI (gitleaks + npm audit) ✅
- `poweredByHeader: false` in Next.js config ✅
