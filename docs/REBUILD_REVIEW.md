# CASA MX — Rebuild Review (input for planning)

> Produced 2026-10-18 by code review of `D:\Projects\casa-mx` (frontend, `staging`) and `D:\Projects\casa-mx-backend` (`staging`).
> Purpose: handoff input for the planner. Nothing in this document is a plan; it is the evidence the plan must cover.

## 0. Context the plan must respect

- **Product**: Mexican real-estate marketplace. Sale + rent, offers/negotiations, rental applications, INE verification, legally-valid PDF contracts per state, credit system, agency memberships, Stripe, CFDI.
- **Business model to preserve and grow**: credits for contact unlocks; agency memberships; **promoted listings, especially the homepage carousel (4 slots, 20 credits/day, `promotionTier: "carousel"`)**. The carousel is an ad product — it must get better, not be removed.
- **Language**: all user-facing copy is Spanish (es-MX).
- **Repos**: frontend `D:\Projects\casa-mx` (Vercel, branch `staging`); backend `D:\Projects\casa-mx-backend` (Railway, branch `staging`). Separate git repos. No monorepo.
- **Deploy rules**: staging auto-deploys on push. **Production is never touched without an explicit "merge to production" / "/deploy".**
- **Scale of change**: full rebuild of the frontend, route by route, production stays live throughout.
- **Keep**: current logos and icons (re-cut, don't redesign the mark), carousel/ad subsystem, Spanish copy, existing brand name and tagline ("Tu ruta, tu decisión").

## 1. Current state, measured

| Metric | Value |
|---|---|
| Frontend source | 288 files, ~25.4k lines (9k of that is tests) |
| Components | 123, of which **110 are `"use client"`** (89%) |
| Data layer | **67 raw `fetch()`**, 6 `useQuery`, 69 `useEffect` |
| Backend | Fastify 5 + Prisma + PG + Redis, ~17.9k lines |
| Stack | Next 15.5, React 18.3, Tailwind 4, JS/JSX (no TS) |
| Routes | 46 `page.jsx` files |
| Largest JS chunk | 414 KB |
| Production API | no compression, no CDN (`Server: railway-hikari`) |
| Production catalog | empty (user deleted listings — expected) |

## 2. KEEP (do not rebuild or remove)

| Thing | Why | Where |
|---|---|---|
| **Carousel / ad subsystem** | Revenue surface. 4-slot scarcity is the pricing lever. | `components/HomepageCarousel.jsx` (271), `components/FeaturedCarousel.jsx` (250), `app/admin/carousel/page.jsx` (353), `lib/api/carousel.js`; backend `promotionTier`, `featuredUntil`, `POST /properties/:id/promote` (RATES featured 5/day, carousel 20/day, max 4 carousel slots) |
| Existing logo mark + icons | Brand equity. Re-cut to SVG/optimized, do not redesign the symbol. | `public/brand/logo-mark.png`, `logo-primary@2x.png`; icons via `lucide-react` |
| Property detail server rendering | Already correct: async server component + JSON-LD + 404. | `app/properties/[id]/page.jsx` |
| URL-state filters | `nuqs` + `searchParams` is the right call. | `app/properties/page.jsx` |
| Security headers | Production HTML and API both have CSP, HSTS, COOP/CORP, XFO. Don't regress. | `next.config.js`, backend `app.ts` |
| Zod validation, CSRF, refresh rotation, rate limits | Already implemented and verified live. | backend |
| Tailwind 4 token approach | `@theme` tokens + dark mode are fine foundations. | `app/globals.css` |
| Contracts / PDF / INE / credits / applications / agencies | Core product, works. Rebuild UI only where it is part of the cutover. | backend routes |

## 3. FIX — ranked

### P0 (user-visible speed or revenue)

- **C-01 Auth waterfall.** `AuthContext` calls `getSession()` then `getUserById()`, sequentially, in the root layout, on every cold load. Anonymous users pay a 401. Fix: one `GET /auth/session` returning `{session, user}`; seed from a server component. `lib/auth/AuthContext.jsx:47-73`.
- **C-02 Listing is client-rendered.** `"use client"` + `useInfiniteQuery` means HTML → JS → cross-origin API → render. Fix: fetch page 1 in a server component with `revalidate`, pass `initialData`. `app/properties/page.jsx:2,130`.
- **C-03 Logo assets are oversized and raster-only — not an LCP emergency.** Correction to an earlier claim: Next's image optimizer already serves the NavBar logo at `w=384&q=75` (~10–20 KB each), so the browser does **not** download 1.28 MB. The real issues are: two requests (light + dark both emitted, one hidden), raster-only so it cannot stay crisp at every size, and 1.28 MB of source files in the repo/deploy. `components/NavBar.jsx:117-130`. Fix in P0: one SVG per variant, CSS-switched, ≤ 20 KB total.
- **C-04 API responses are uncompressed.** No `@fastify/compress`; no proxy compression. JSON (listing, dashboard) ships raw. Fix: register compress in Fastify.
- **C-05 Public GETs set CSRF cookies**, which makes `Cache-Control: s-maxage=60` unusable by any shared cache. Either stop issuing CSRF cookies on safe/public GETs, or drop the misleading cache header. Verified live on `/properties`.
- **C-06 Carousel priority is wrong for an ad product.** `HomepageCarousel` falls back: custom slides → paid `carousel` tier → most-viewed → latest 6. An unsold slot silently advertises free properties, which weakens the paid product and makes reporting meaningless. Fix: explicit slot states (`paid` / `admin` / `house`) and label house content. `components/HomepageCarousel.jsx:218-236`.
- **C-07 Carousel data is fetched three ways.** It calls `useProperties()` (infinite query, 12/page), `getCarouselSlides()`, and `getMostViewedProperties()` with fallback chaining. For 4 slots this should be one endpoint. Fix: `GET /carousel` returns ordered slots with `source` and `impressionId`.

### P1 (correctness and caching)

- **C-08 Silent catch renders fake 404s.** `getPropertyById` returns `null` on any error; `getFilterOptions` returns empty on any error. A 500/timeout becomes "Propiedad no encontrada". `lib/api/properties.js:54-62,123-129`.
- **C-09 Property detail is uncached and cookie-blind.** Server fetch sends no browser cookies, so an owner cannot SSR their own draft; and the heaviest read has no cache. Decide: public-only detail (cacheable) vs. authenticated detail (dynamic).
- **C-10 No shared query defaults.** Fixed in `60c009f` (60 s stale, no focus refetch). Keep for dashboards; document it so new code doesn't override blindly.
- **C-11 Backend does a write on every listing read.** Fixed in backend `353aba7` (expired promos now hidden in `publicPropertyView`). Verify: `total` is still asserted by 4 backend tests — do not remove it without updating them.
- **C-12 Error/loading/empty states are re-rolled per page.** `PropertyList.jsx` has the good skeleton + empty state; other routes invent their own. Consolidate into primitives.
- **C-13 Metadata claims `logo-mark.png` is `image/svg+xml`.** It is a PNG. `app/layout.jsx:50`.
- **C-14 Font is declared but not loaded.** `globals.css` names `"DM Sans", "Inter"`; layout loads only Inter via `next/font` and applies `inter.className`. One family is dead. `app/globals.css:19`, `app/layout.jsx:28-33`. Also `--font-family-sans` is not the Tailwind 4 `--font-sans` namespace.

### P2 (code size and drift)

- **C-15 No type contract.** 67 hand-written fetches against a Zod-validated backend. Fix: Fastify JSON schemas → OpenAPI → `openapi-typescript` → committed `lib/api/types.ts`. New/rewritten routes in TypeScript; do not mass-convert 25k lines of JSX.
- **C-16 Query-param mapping duplicated.** 36 `if (x) append()` lines mirror the backend filter schema. Replace with a field list; fixes the "Fastify silently drops unknown keys" landmine.
- **C-17 `toLocaleString` in 53 places.** One `formatMoney` / `formatDate` in `lib/utils`.
- **C-18 49 loose files in `components/`.** Move to feature folders + a small primitives layer. Only extract what removes duplication.
- **C-19 Locations catalog merge is defensive and verbose.** `Promise.allSettled([oneThing])` + `be.id || be.name || ""`. Shared types delete most of it. `lib/api/locations.js`.

## 4. REMOVE

| Item | Evidence | Risk |
|---|---|---|
| `components/HeroCarousel.jsx` | Never imported | done (`60c009f`) |
| `public/brand/logo-test.png` | Duplicate of `logo-horizontal.png` (identical 1129×758, 732 KB) | none |
| Redundant logo exports (`logo-horizontal`, `logo-stacked`, `logo-primary`, `logo-icon`, `logo-light`, `logo-dark`) | NavBar only needs light/dark; metadata needs mark + og | none, keep the source art out of the bundle |
| Client-side `xlsx@0.18.5` | Unpatched CVEs; only used by import wizard | medium — move parsing server-side |
| `DebugProvider` + `DebugPanel` in root layout | Ships to every visitor; prod-gated but bundled | low |
| Catbox photo re-hosting | Third-party dependency in the publish pipeline | medium — verify nothing references `files.catbox.moe` |
| `.opencode/skills/security-audit/SKILL.md` current VULN list | Claims CSP disabled, CSRF missing, no password reset — all false now | none; rewrite against current code |
| 28 thin `lib/api/*` files | Collapse to ~8 domain modules | low |
| Duplicate inline SVG/emoji icons | `lucide-react` already installed | cosmetic |

## 5. Visual identity brief (keep the marks, change the system)

### What is broken now

- The logo is raster-only: two 700 KB+ PNG sources, two optimizer requests, no vector (C-03). Visual identity work starts with a correct asset pipeline.
- Palette exists but is under-used: `--color-clay #9A4E37`, `--color-sand #EAE4DD`, `--color-ink #1C1B19`, plus a dark theme toggled via `document.documentElement.classList` in `NavBar`.
- Type is inconsistent: DM Sans is named but never loaded; Inter is loaded. No display face, so every heading is UI type.
- 46 routes share only a `container` utility; there is no page shell, no consistent card/field/button system.
- Mixed neutrals: brand tokens (`clay/sand/ink`) alongside raw `neutral-*` in most components. Dark mode is real but ad-hoc.

### Direction to plan (planner chooses and specifies one)

A Mexican editorial-modern identity: **clay + sand + ink**, photography-first listing cards, a route/map motif that matches "Tu ruta, tu decisión", restrained motion, high-contrast type. Keep the existing mark as the anchor.

### Identity deliverables the plan must specify

1. **Asset pipeline**: logomark and wordmark as SVG; light/dark variants; favicon set; OG image; total logo weight ≤ 20 KB.
2. **Tokens**: primitive → semantic → component (color, spacing 8pt, radius, elevation, motion, z-index). One neutral ramp derived from sand/ink; delete raw `neutral-*` usage during cutover.
3. **Type**: one display face + one UI sans (self-hosted via `next/font`), fixed scale, Spanish diacritics checked.
4. **Primitives**: Button (3 variants), Input/Select/Textarea/Field, Card, Badge, Modal/Sheet, Skeleton, EmptyState, Toast, Table. Only these get built; everything else composes.
5. **Page shells**: public (SEO, server-rendered) vs. app (dashboard) vs. admin.
6. **Carousel/ad art direction**: slide overlay rules, price/location typography, paid vs. house labeling, impression/click attribution, 4-slot cap.
7. **Accessibility**: contrast ≥ 4.5:1, visible focus, 44 px targets, reduced-motion fallback, axe checks in E2E.
8. **Dark mode**: keep, but drive it from tokens and a proper provider, not two PNGs.

## 6. Non-goals

- No framework swap. Stay on Next (upgrade to 16/React 19 during cutover, not as a separate project).
- No monorepo. No shared package. Contract via generated types.
- No mass JS→TS migration. New code is TS; old code converts when its route is cut over.
- No feature deletion of carousel, credits, contracts, INE, agencies, offers, applications.
- No production changes in this phase.

## 7. Open questions for the user

1. Are there real promoted/carousel advertisers today, or is the slot inventory unsold?
2. Should house/fallback content appear in unsold slots at all, or should the slot collapse?
3. Logo files: is there a vector source (AI/SVG), or must the SVG be traced from the PNG?
4. Is dark mode a product requirement or an experiment?
5. Is the dashboard meant to feel like the same brand as the public site, or deliberately denser/tool-like?

## 8. Suggested sequencing (planner should refine, not copy)

1. Foundations: asset pipeline, tokens, primitives, page shells, TS contract generation.
2. Public: home + carousel → listing → detail.
3. Auth: single session call, server seeding, login/register.
4. Publish/upload: split the 686-line form into steps with `useFormContext`.
5. Dashboard: my-properties, offers, applications, CRM, agency.
6. Admin: analytics, approvals, carousel manager, properties.
7. Cleanup: delete the Remove list, rewrite the stale audit skill, update docs.

Each step: staging deploy, tests green, one route revertible. Production cutover only on explicit approval.
