# CASA MX — Knowledge Reference

> Last updated: 2026-05-27
> OpenCode reads this first before any task.

## Full Stack — Two Repos

This project spans **two repositories**. Always consider both when making changes:

| Repo | Path | Stack |
|---|---|---|
| **Frontend** | `C:\Users\axelj\casa-mx` | Next.js 15 (App Router), React 18, Tailwind 3.4 |
| **Backend** | `C:\Users\axelj\casa-mx-backend` | Fastify 5, TypeScript, Prisma 5, PostgreSQL 16, Redis 7 |

Both repos share: Zod schemas, JWT httpOnly cookie auth, Stripe integration. Frontend deploys to Vercel, backend to Railway via Docker.

---

## Behavioral Rules

1. **Read before coding** — read every involved file first. Check how similar features are built. If unclear, stop and ask.
2. **Simplicity first** — fewer lines wins. No premature abstractions. If a junior dev can't read it, rewrite it.
3. **Surgical changes only** — edit what's broken, nothing else. No rewriting files to fix one function. Small diffs.
4. **Goal-driven execution** — ask *why* before *how*. Build what's asked, not what you think is wanted.
5. **Never remove existing endpoints** — keep old endpoints with original response shapes. Add new alongside.
6. **Prisma schema changes need migration files** — use `prisma migrate dev`, not `prisma db push`. CI needs `.sql` files.
7. **Check Docker first for infra** — backend runs PostgreSQL + Redis + backend via Docker Compose. Check `docker compose ps` first.
8. **Check git branch** — verify with `git status` before changes.
9. **Test critical paths after every code change** — before pushing, verify the most vulnerable flows still work. See checklist below.

### Pre-push testing checklist

**If auth files changed** (`lib/api/auth.js`, `src/routes/auth.ts`, `AuthContext.jsx`, `auth.service.ts`):
```
curl -X POST https://api.casa-mx.com/auth/login -H "Content-Type: application/json" -d '{"email":"5axelj@gmail.com","password":"CasaMX2026!"}'
```
Expect 200. If 401 or 500, DO NOT PUSH.

**If API wrappers changed** (`lib/api/*.js`):
```
npm run build    # both repos must compile
npm test -- --run  # 77 tests must pass
```

**If forms changed** (`app/*/page.*`):
- Verify all `<form>` elements have `method="POST"` — prevents credential leak via URL query params

**After deploy:**
```
1. Login at casa-mx.com → role picker should appear
2. Carousel loads on homepage (mobile too)
3. /admin/analytics/market shows data
4. Back button works, no redirect loops
5. DevTools Console: no CSP violations, no CORS errors
```

See also: `docs/DEVELOPMENT_RULES.md`

---

## Project Architecture

### Frontend (`casa-mx/`)

```
app/                      # Next.js App Router pages
  admin/                  # Admin: approvals, properties, analytics, agencies, maps, debug
  dashboard/              # Role-filtered hub: offers, applications, my-offers, contact-requests
  properties/             # Listings, detail [id], import, map
  login/ register/ settings/ credits/ reviews/ requested/
components/
  analytics/              # MarketAnalytics: KPI cards, charts, city table, opportunities (Phase 6)
  guards/                 # RequireAuth, RequireRole
  map/                    # Leaflet: PropertyMap, createMarker
  NavBar.jsx, DesktopNavLinks.jsx, MobileMenu.jsx
  MakeOfferModal, OfferRespondModal, ContactRequestModal, LeaveReviewModal
  PropertyUploadForm, PropertyImportWizard, PropertyCard, PropertyList
lib/
  api/                    # Backend API wrappers (16 files)
  auth/                   # AuthContext, CreditsContext, useAuth
  analytics/              # Event tracking (providers, useAnalytics)
  queries/                # React Query hooks (properties, requests)
  validation/             # Zod schemas (propertySchema, contactRequestSchema)
  constants/              # financing, propertyOptions, propertyServices, statusLabels
  utils/format.js         # formatNumber, formatCurrency, formatDate, formatPercentage
```

### Backend (`casa-mx-backend/`)

```
prisma/
  schema.prisma           # 23 models: User, Role, Property, PropertyOffer, PropertyRequest,
                           # RentalApplication, Review, Negotiation, Credit*, AnalyticsEvent,
                           # Notification, Debug*, AuditLog, ApiLog
src/
  routes/                 # 22 route files (auth, properties, offers, requests, reviews,
                           # applications, negotiations, credits, admin, analytics, debug...)
  services/               # auth.service, credits.service, reviews.service, cache.service,
                           # maps.service, email.service
  schemas/                # Zod validation per route
  utils/                  # guards.ts (auth middleware), errorHandling, badges
  config/                 # env.ts
  plugins/                # jwt.ts, prisma.ts, logging.ts, mapsMonitor.ts
```

---

## Tech Stack (abbreviated)

- **Frontend:** Next.js 15 (App Router), React 18, Tailwind 3.4 (`class` dark mode), react-hook-form + zod, @tanstack/react-query 4, Leaflet, recharts 3.6, Stripe.js
- **Backend:** Fastify 5, Prisma 5, PostgreSQL 16, Redis 7, JWT httpOnly cookies, AWS S3, SendGrid, Zod
- **Tests:** Vitest (unit/integration), Playwright (E2E)
- **CI:** GitHub Actions — CI, Security Scan, Playwright E2E (on push to main)
- **Infra:** Frontend → Vercel, Backend → Railway Docker

---

## Key Patterns

### Auth
- JWT in httpOnly cookies (not localStorage). All fetches use `credentials: 'include'`.
- `useAuth()` hook from `lib/auth/useAuth.js` wraps `AuthContext` — provides `login`, `logout`, `switchRole`, `user`, `refreshUser`.
- `activeRole` on user object controls dashboard visibility.
- `RequireRole` guard (`components/guards/RequireRole.jsx`) checks approved role; uses `router.replace` (not push) to avoid back-button traps.

### API Calls
- `BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'`
- `credentials: 'include'` on every fetch
- `parseResponse()` pattern: `lib/api/requests.js`, `offers.js`, `applications.js`, `reviews.js`, `negotiations.js`, `notifications.js`, `subscriptions.js`
- `fetchWithAuthRetry()` pattern: `lib/api/properties.js` (retries on 401 after token refresh)

### Credits
- 1 MXN = 10 credits. Credits unlock contact info, featured badges, promoted listings.
- `CreditBalance`, `CreditTransaction`, `CreditPackage`, `UserSubscription` models.

---

## Testing

```
npm test -- --run          # Vitest (77 tests, 29 files)
npm run test:e2e:auto      # Playwright E2E (starts dev server automatically)
```

---

## Recent Changes (2026-05-27)

### Phase 6 — Admin Market Analytics Dashboard

**New files (7):**
- `lib/api/analytics.js` — admin analytics API wrapper for 7 new endpoints
- `app/admin/analytics/market/page.jsx` — dashboard shell (admin-only, Venta/Renta toggle synced to URL)
- `components/analytics/MarketKpiCards.jsx` — 6 KPI cards with MoM trend arrows
- `components/analytics/OpportunitiesPanel.jsx` — 5 actionable alerts (hot zones, underpriced, stale, trends)
- `components/analytics/OfferIndexChart.jsx` — bar chart: median offer/m² by city
- `components/analytics/OfferTrendChart.jsx` — multi-line 12-month trend
- `components/analytics/CityMarketTable.jsx` — sortable city table + colonia drilldown + trend chart + comps

**Modified files (2):**
- `components/MobileMenu.jsx` — added "📊 Análisis de mercado" admin link
- `components/guards/RequireRole.jsx` — `router.push` → `router.replace` fixes back-button trap

**Key design:**
- All state: loading skeleton, error with retry, empty placeholder, data display
- Performance: `React.memo` on CityRow, `useMemo` on chart data, `useCallback` on sort/fetch
- URL-synced Venta/Renta toggle (`?tipo=renta`), drilldown respects active type
- Error differentiation: 401/403 → null, 5xx/network → throws with message

### Other recent fixes
- `lib/queries/properties.js` — removed error-swallowing try/catch; `useProperties` now surfaces `isError`/`error`
- `components/HomepageCarousel.jsx` — added loading skeleton + error state + retry button
- `components/FeaturedCarousel.jsx` — replaced `return null` with placeholder on empty
- `components/PropertyImportWizard.jsx` — added `listingType` column (Venta/Renta) to bulk import
- `ejemplo-importacion-casamx.xlsx` — example sheet with 25 columns, 5 sample properties

### Verification
- 77 Vitest tests pass, build clean (37 pages), back button works correctly

---

## Pending / Known Gaps

### Backend endpoints — COMPLETED
7 admin analytics endpoints built in `casa-mx-backend/src/routes/analytics.ts` + `src/services/analytics.service.ts`:
- `GET /admin/analytics/market-summary`, `/market-by-city`, `/market-by-colonia`
- `GET /admin/analytics/offer-trends`, `/offer-analysis`, `/opportunities`, `/comps`
- Backend compiles clean, all endpoints guarded with `requireAdmin`

### Security — Status

**FIXED (20 of 25):**
| ID | Issue | Resolution |
|---|---|---|
| VULN-01 | JWT in response body | Removed from login, refresh, OAuth responses |
| VULN-02 | API log PII | `requestBody`/`responseBody` no longer captured |
| VULN-03 | Gitleaks whitelist | Already resolved |
| VULN-04 | No password reset | `POST /auth/forgot-password` + `POST /auth/reset-password` added |
| VULN-05 | No CSRF | `@fastify/csrf-protection` installed + frontend sends `x-csrf-token` header |
| VULN-07 | Stored XSS | Already resolved (uses textContent) |
| VULN-08 | Type bypass applications | `as any` cast removed |
| VULN-09 | Type bypass properties | Already resolved |
| VULN-10 | No account lockout | 5 failed attempts → 15min lockout |
| VULN-12 | Logout cookie missing secure | Already resolved |
| VULN-13 | CSP `unsafe-inline` | Replaced with `'strict-dynamic'`, removed `unpkg.com` from styleSrc |
| VULN-14 | Docker root build | `USER node` in builder stage |
| VULN-15/16/17 | Hardcoded creds + exposed port | Env vars, backend port → 127.0.0.1 |
| VULN-18 | Debug PII | `userEmail`/`ipAddress` no longer captured in debug logs |
| VULN-19 | User enumeration | Already resolved |
| VULN-20 | Missing Zod .max() | Added to Login, Refresh, OAuth schemas |
| VULN-21 | Missing numeric bounds | Added to properties, applications, offers schemas |
| VULN-22 | Weak passwords | Now require uppercase + lowercase + digit in register + reset |
| VULN-24 | Timestamp disclose | Removed from health endpoint |
| VULN-25 | E2E hardcoded repo | Uses `${{ vars.BACKEND_REPO }}` |

**REMAINING (5 of 25):**
- VULN-06 — secrets on disk (needs key rotation on provider dashboards)
- VULN-11 — MFA (full feature, future)
- VULN-23 — OAuth audience skip already fixed (mandatory check now)
- Migration file generated at `prisma/migrations/20260527210000_add_password_reset_and_lockout/migration.sql`

### Pre-launch checklist
- [x] Migration `.sql` file generated and marked as applied
- [x] CSRF protection: `@fastify/csrf-protection` + frontend `x-csrf-token` header
- [x] `sameSite: 'lax'` (strict would block cross-origin cookie sends for OAuth)
- [x] Railway env vars: `ADMIN_EMAIL`, `MIGRATION_SECRET` set
- [x] `prisma db push` synced all missing columns on Railway
- [x] Bootstrap admin: `POST /admin/setup-admin` creates admin account with all roles
- [x] Account lockout: 5 failed attempts → 15min lockout (re-enabled after DB sync)
- [x] Backend deployed, health endpoint sanitized
- [x] Frontend deployed, CORS whitelisted `casa-mx.com` + `www.casa-mx.com`
- [x] Admin login verified: `5axelj@gmail.com` with all 6 roles approved
