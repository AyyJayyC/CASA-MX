# CASA MX — Rebuild Plan

> Input: `docs/REBUILD_REVIEW.md` (authoritative) + `docs/VISION_AND_PURPOSE.md` + code spot-checks at `staging` on both repos.
> Frontend `D:\Projects\casa-mx` (Vercel) · Backend `D:\Projects\casa-mx-backend` (Railway). Two repos, no monorepo, no shared package.
> **Production is never touched in any phase of this document.** Staging auto-deploys on push. Promotion to `main` is a separate, explicitly approved step at the end.

## 0. How to use this

Each phase is one revertible unit on `staging`: a branch, a green CI, a staging URL to check, then a squash merge. Phases are ordered by dependency, not by calendar. Sizes (S/M/L) are relative effort, not time.

Two rules that prevent most accidental damage:

1. **Structure first, content second.** Phase 0 only moves files and installs foundations; no route changes behaviour until Phase 1.
2. **Every phase ends with the same gate** (§8). A phase that does not pass the gate is not done, regardless of how good it looks.

---

## 1. Target architecture

### 1.1 Route groups

The current flat `app/` gives all 46 routes the same chrome: a `container` wrapper, the NavBar, a marketing footer, `AuthProvider`, `DebugPanel`. Route groups fix that with zero new abstractions.

```
app/
  layout.tsx                       root: <html lang="es">, fonts, theme script, tokens, ToastProvider. No chrome.
  not-found.tsx
  error.tsx                        global fallback
  (public)/
    layout.tsx                     NavBar + Footer + CookieConsent + ReferralTracker
    page.tsx                       home (carousel + editorial sections)
    properties/page.tsx            listing
    properties/[id]/page.tsx       detail
    properties/map/page.tsx        map view
    aviso-legal/page.tsx  terminos/  cookie/  reembolsos/  consent/
  (auth)/
    layout.tsx                     centered 420px card, logomark only, no nav
    login/  register/  forgot-password/  reset-password/  verify-email/
  (app)/
    layout.tsx                     dashboard shell; server-checks session; redirects to /login
    dashboard/page.tsx
    dashboard/my-properties/  my-properties/[id]/preview/  contact-requests/  leads/
    dashboard/offers/  my-offers/  applications/  rental-applications/  contracts/
    dashboard/crm/  agency/  integrations/  notifications/  shared/  account/
    settings/  credits/  requested/
    publish-property/page.tsx
    properties/import/page.tsx
    properties/[id]/edit/page.tsx
  (admin)/
    layout.tsx                     dense admin shell; requireAdmin (server) + redirect
    admin/page.tsx  analytics/  analytics/market/  approvals/  carousel/
    properties/  agencies/  maps/
```

Phase 0 performs this as **pure `git mv`** with the old chrome redistributed into the group layouts. Nothing else changes in that commit, so a screenshot diff proves no regression.

Delete `app/upload/` (redirects to `/publish-property?tipo=sale|renta`), `app/admin/debug` (dev-only, moves behind `NODE_ENV` check in `admin/maps`), and `app/dashboard/debug` does not exist today — leave names alone otherwise.

### 1.2 Server vs client boundary

Today 110 of 123 components are `"use client"` because data fetching happens in effects. The target is the opposite: **pages and layouts are server components; `"use client"` appears only at the leaves that need state, events or browser APIs.**

Rules for all new code:

1. `page.tsx` / `layout.tsx` / `error.tsx` / `not-found.tsx` are server components. Always.
2. A component gets `"use client"` only if it uses `useState`, `useEffect`, `useRef`, an event handler, `window`/`document`, or a client-only library (Leaflet, Recharts, Stripe Elements).
3. Client islands receive **serializable props only**. They never import `lib/server/*`.
4. Data comes from the server. `useEffect(() => { fetch... })` is banned in new code; the replacement is a server fetch or React Query seeded with `initialData`.
5. `metadata` / `generateMetadata` live in the page, never in a client component.
6. When a client island needs refreshed server data after a mutation: call a server action that revalidates the tag, then `router.refresh()`.

Client islands this plan will create (complete list; anything else is a mistake):

| Island | File | Why |
|---|---|---|
| Carousel viewport + controls | `components/public/carousel/Carousel.tsx` | autoplay, swipe, keyboard, impressions |
| Filter panel | `components/public/listing/FilterPanel.tsx` | `nuqs` URL state |
| Infinite results | `components/public/listing/ListingResults.tsx` | pagination |
| Map | `components/map/PropertyMap.tsx` | Leaflet |
| Photo gallery | `components/property/detail/Gallery.tsx` | lightbox |
| Auth forms | `components/auth/*Form.tsx` | validation, submit |
| Session menu | `components/public/SessionMenu.tsx` | one `/auth/me` probe |
| Theme toggle | `components/theme/ThemeToggle.tsx` | localStorage |
| Notifications bell | `components/app/NotificationBell.tsx` | polling |
| Publish wizard | `components/forms/property/Wizard.tsx` | multi-step form |
| Dashboard tables w/ actions | `components/app/*Table.tsx` | row actions |
| Admin slot grid | `components/admin/CarouselSlotGrid.tsx` | drag/assign |

Target after Phase 8: **≤ 35 `"use client"` files** (from 110). Measured in CI.

### 1.3 Data flow

**Public read (cacheable)**
```
page.tsx (server)
  -> lib/server/properties.ts        fetch(`${API}/properties?...`, { next: { revalidate: 60, tags: ["properties"] } })
  -> props
  -> <ListingResults initialData={page1} />   (client, hydrates React Query)
```

**Authenticated read (never cached)**
```
(app)/layout.tsx (server)
  -> lib/server/session.ts   getSession()  // React cache(): one call per request
       cookies() -> Cookie: accessToken=...; refreshToken=...
       fetch(`${API}/auth/me`, { headers: { cookie }, cache: "no-store" })
  -> 401 => redirect("/login?redirect=<path>")
  -> <SessionProvider initialUser>  (client context, no refetch on mount)
```

Server-side auth works because the backend guards read `request.cookies.accessToken` (`src/utils/guards.ts:19-34`), so forwarding the `Cookie` header is sufficient. The server **never refreshes tokens**: refresh rotation is httpOnly cookie work that must happen in the browser to keep the CSRF pair in sync.

**Mutation**
```
client island -> lib/api/client.ts apiFetch()  (browser cookies + x-csrf-token)
             -> on 2xx: revalidateProperty(id)   // server action, app/_actions/revalidate.ts
             -> router.refresh()
```

**Error policy (replaces C-08).** `lib/server/fetch.ts` throws a typed `ApiError { status }`. Pages map: `404 -> notFound()`, `>=500 -> throw` (caught by route `error.tsx`), `401 -> redirect("/login")`. No `catch { return null }` anywhere. A network failure must never render "no encontrada".

### 1.4 Caching strategy

Confirmed from the review and from the code: **there is no CDN in front of the API.** `api.casa-mx.com` is Railway direct (`Server: railway-hikari`), there is no `@fastify/compress` registered in `src/app.ts`, and no proxy cache. Vercel caches the frontend only.

So caching lives in exactly two places:

| Layer | What | Where |
|---|---|---|
| Next Data Cache / Full Route Cache | public reads | `fetch(..., { next: { revalidate, tags } })` |
| Redis | locations catalog only | backend `cacheService` (already) |

| Route | Rendering | Cache | Revalidate | Tag |
|---|---|---|---|---|
| `/` | static (ISR) | full route + data | 60s | `carousel`, `properties` |
| `/properties` | dynamic (searchParams) | data only | 60s | `properties` |
| `/properties/[id]` | static on-demand (ISR) | full route + data | 300s | `property:<id>` |
| `/properties/map` | dynamic | data only | 60s | `properties` |
| legal pages | static | full route | forever | — |
| `(auth)/*` | static shell | full route | forever | — |
| `(app)/*`, `(admin)/*` | dynamic | none (`no-store`) | — | — |

`/properties/[id]` being static is the C-09 decision: **the public detail page is public-only and cacheable.** Owners preview drafts at `/dashboard/my-properties/[id]/preview` (dynamic, cookie-aware). Do not make the public page cookie-aware; it would forfeit the only page in the product heavy enough to benefit from a full-route cache.

Backend preconditions, both in Phase 0:
- **C-04**: register `@fastify/compress` (`gzip`, `brotli`, threshold 1024).
- **C-05**: stop issuing the `csrfToken` cookie on `GET`/`HEAD` (the `onRequest` hook in `src/app.ts:230` currently fires on every request). Enforcement on mutations is unchanged. Without this, the `Cache-Control: s-maxage=60` header on `/properties` is a lie and any future shared cache would serve one user's token to another.

### 1.5 Auth flow

```
anonymous -> any (app)/(admin) route
  middleware.ts: cookie presence only (fast path, no network)
  (app)/layout.tsx: getSession() -> null -> redirect(/login?redirect=...)
                    -> if 200: render shell, pass user to SessionProvider

login (client form)
  POST /auth/login -> Set-Cookie accessToken (httpOnly), refreshToken (httpOnly), csrfToken (readable), cmx_session=1
  -> SessionProvider.setUser(response.user)
  -> router.replace(redirect ?? "/dashboard"); router.refresh()

public page (anonymous-first)
  (public)/layout.tsx renders anonymous chrome, no cookies() call  -> page stays static
  <SessionMenu> island: if document.cookie has cmx_session -> GET /auth/me (1 request)
                        else skip entirely (0 requests)
  401 in any island -> apiFetch refreshes once, retries, else clears state
```

Why anonymous-first chrome: reading `cookies()` in a layout de-opts every public page to dynamic rendering, which would kill the ISR on `/` and `/properties/[id]`. The tradeoff costs one `/auth/me` per hard navigation for logged-in users, with a 40×40 skeleton reserved so CLS stays 0.

`cmx_session` is a non-httpOnly marker cookie, set/deleted by the backend alongside the auth cookies. It exists only to avoid firing a guaranteed-401 probe for first-time visitors. No authorization decision may ever read it.

**C-01 fix**: `GET /auth/me` already returns the full user including roles and agency. It lacks `avatarUrl`, `paidSubscriber`, `subscriptionStatus`, `subscriptionCurrentPeriodEnd` — which is the only reason `AuthContext` makes the second call to `/users/:id`. Add those four fields to `/auth/me` and delete `getUserById` from the hydration path. One request becomes one request. No new endpoint.

### 1.6 Contract and types

Backend is Zod-validated but publishes no machine-readable contract, so the frontend hand-writes 67 fetches (C-15). Pipeline, incremental per phase:

```
backend/src/openapi/registry.ts     // zod schemas -> JSON Schema, one entry per consumed endpoint
backend/scripts/openapi.mjs         // writes openapi.json at repo root, committed
frontend/scripts/gen-api-types.mjs  // fetch `${API}/openapi.json` (dev only) -> lib/api/schema.d.ts, committed
```

- `GET /openapi.json` served only when `NODE_ENV !== "production"`.
- Frontend builds never need the backend: `schema.d.ts` is committed.
- `lib/api/types.ts` re-exports the four or five types per domain from `components["schemas"]`.
- Rule: **any endpoint the frontend calls must exist in the registry before its phase merges.** A phase that adds a call without a schema fails review.
- `tsconfig.json` gains `"strict": true`. This only affects `.ts`/`.tsx`; `allowJs: true`, `checkJs: false` stay, so no mass JS migration (per non-goals). Old JSX keeps compiling untouched.

### 1.7 Folder structure

```
components/
  ui/          primitives only (§2.5). No feature logic, no fetch.
  brand/       Logo.tsx, Logomark.tsx
  theme/       ThemeScript.tsx, ThemeToggle.tsx
  public/      NavBar, Footer, SessionMenu, carousel/, home/, listing/
  property/    PropertyCard (shared), detail/
  map/         PropertyMap
  auth/        forms
  forms/       property/ (wizard steps), import/
  app/         dashboard shell pieces, tables
  admin/       admin tables, CarouselSlotGrid
lib/
  api/         client.ts, schema.d.ts, types.ts, properties.ts, carousel.ts,
               auth.ts, locations.ts, credits.ts, admin.ts, users.ts   (10 max, from 24 files)
  server/      fetch.ts, session.ts, properties.ts, carousel.ts, locations.ts
  auth/        AuthProvider.tsx, useAuth.ts, SessionProvider.tsx
  format.ts    formatMoney / formatDate / formatArea / formatPhone
  filters.ts   parseFilters / buildPropertyQuery (single field list)
  cn.ts
  queries/     React Query hooks (dashboards only)
styles/
  tokens.css   primitives + semantic + component tokens
app/globals.css  @import tailwind, tokens, base resets only
```

Colocate tests next to files (`format.test.ts`); E2E stays in `tests/e2e`.

---

## 2. Visual identity specification

### 2.1 Direction: "Ruta" — Mexican editorial-modern

The mark, name and tagline stay. The system around them changes from "generic SaaS with a clay accent" to a warm, printed, place-specific identity: sand paper ground, ink type, clay as the single saturated accent, and photography carrying the emotion. A thin route line with waypoint dots is the one graphic device — it is literally the tagline, it works as a divider, a step marker and a map legend, and it costs one SVG.

Why this direction and not another:
- **It matches the product's promise.** The product's differentiator is a *path* (publish → offer → verify → contract), not inventory volume. The route motif makes the flow visible on the home page and in the contract funnel, where competitors show a grid.
- **It survives the existing palette.** `--color-clay #9A4E37` already exists and is used in production. Replacing it would be a redesign nobody asked for; building a real ramp around it is the cheap move.
- **It fixes the type problem.** A display serif gives headings a voice. Today every heading is Inter at 700 — the reason the site reads like a dashboard.
- **It is cheap to execute.** One extra font, one motif, a neutral ramp, three elevation levels. No illustration system, no 3D, no icon redesign.

What it is, concretely: photography-first cards on sand, clay used only for action and emphasis (never as a large background fill), ink for type, generous whitespace, hairline borders instead of shadows, and route-line dividers between sections.

### 2.2 Asset pipeline

Source truth today: `logo-primary@2x.png` (1536×512, 21 KB) proves the art compresses; `logo-light.png` (732 KB) and `logo-dark.png` (553 KB) are what actually ship. Fix the pipeline, not the art.

| Target file | Source | Spec |
|---|---|---|
| `public/brand/logomark.svg` | traced/exported from `logo-mark.png` | currentColor, `viewBox="0 0 64 64"`, ≤ 3 KB |
| `public/brand/logo-light.svg` | `logo-primary@2x.png` | clay+ink on transparent, `viewBox="0 0 176 44"`, ≤ 8 KB |
| `public/brand/logo-dark.svg` | same geometry | sand-50 + clay-300 on transparent, ≤ 8 KB |
| `public/brand/logo-mono.svg` | same geometry | single `currentColor` path, for footers/print, ≤ 6 KB |
| `public/brand/favicon.svg` | logomark | 32×32 artboard, ≤ 2 KB |
| `public/brand/favicon-32.png`, `apple-icon.png` | rendered from the SVG | 32 / 180 px |
| `public/brand/og-default.png` | composed: logomark + tagline on sand | 1200×630, ≤ 120 KB |

Rules:
- **Total logo weight on any page ≤ 20 KB.** Measured: `du -b public/brand/*.svg | awk '{s+=$1} END {print s}'`.
- SVGs are hand-cleaned with `svgo --multipass --precision=2` and committed with `fill="currentColor"` where the geometry allows, so dark mode needs no second file for the mono variant.
- NavBar uses `<Logo variant="auto" />` rendering `logo-light.svg` + `logo-dark.svg` via CSS (`dark:hidden` / `hidden dark:block`) — two static SVGs of ≤ 8 KB each, both cached, no `<Image>` transform, no PNG.
- Everything not in the table is deleted (see §5): `logo-test.png`, `logo-horizontal.png`, `logo-stacked.png`, `logo-primary.png`, `logo-icon.png`, `logo-light.png`, `logo-dark.png`. Keep the PNG art in `docs/brand-source/` (not in `public/`).
- Metadata references `favicon.svg` with `type: "image/svg+xml"` — this also fixes **C-13**, where `logo-mark.png` is declared as SVG.

Risk: if no vector source exists (open question 3), trace with `potrace` at 2× and hand-correct the counters; if the trace reads poorly at 32px, ship `logo-primary@2x.png` (21 KB) as the wordmark and only vectorize the logomark. Do not redraw the symbol.

### 2.3 Type

Pairing: **Fraunces** (display, variable serif) + **Inter** (UI). Both via `next/font/google`, self-hosted at build, subset `latin` (Spanish diacritics live in `latin`: Á É Í Ó Ú Ñ Ü á é í ó ú ñ ü ¿ ¡ — verify in a test page, it is the one thing a font swap breaks silently).

- Fraunces: `axes: ["SOFT", "WONK", "opsz"]`, weights 400–700, `display: "swap"`, CSS var `--font-display`. Used only at `display-*` and `heading` sizes — never for UI labels or table text.
- Inter: weights 400/500/600, `--font-sans`. Everything else.
- Delete the dead `"DM Sans"` from `globals.css` and the `--font-family-sans` key (**C-14**). Tailwind 4 reads `--font-sans`, not `--font-family-sans`.

Scale (fixed, `rem`, only `display-*` uses `clamp`):

| Token | Size / line / tracking | Use |
|---|---|---|
| `display-xl` | clamp(40, 5vw, 64) / 1.05 / -0.02em | home hero, one per page |
| `display-l` | clamp(32, 4vw, 46) / 1.08 / -0.02em | page titles |
| `display-m` | 34 / 1.15 / -0.01em | carousel price, section openers |
| `heading` | 26 / 1.2 / -0.01em | section headers |
| `title` | 20 / 1.3 / 0 | card titles, panel headers |
| `body-lg` | 18 / 1.6 / 0 | article copy, detail description |
| `body` | 16 / 1.6 / 0 | default |
| `small` | 14 / 1.5 / 0 | metadata, helper text, dashboard base |
| `caption` | 12 / 1.4 / 0.01em | timestamps, legal |
| `overline` | 12 / 1.2 / 0.08em, uppercase, 600 | `PROMOCIONADO`, field labels, table headers |

Numbers in prices, areas, credits and table columns use `font-variant-numeric: tabular-nums`. All prices go through `formatMoney` (§ C-17): `$1,250,000 MXN`, `$18,500 /mes`.

### 2.4 Tokens

Three layers, wired for Tailwind 4 so dark mode is a variable swap, not a component variant. Primitives live in `@theme`; semantic values live in `:root` / `.dark`; `@theme inline` exposes the semantic ones as utilities (`bg-surface`, `text-muted`, `border-line`).

```css
/* styles/tokens.css */
@theme {
  --color-clay-50:#F8EFEA; --color-clay-100:#EFDCD3; --color-clay-200:#E0BFB0;
  --color-clay-300:#CC9C87; --color-clay-400:#B4745A; --color-clay-500:#9A4E37; /* brand */
  --color-clay-600:#823F2C; --color-clay-700:#683224; --color-clay-800:#4C2416; --color-clay-900:#2E150C;
  --color-sand-50:#FAF7F3; --color-sand-100:#F2EDE6; --color-sand-200:#EAE4DD;
  --color-sand-300:#DCD3C9; --color-sand-400:#C6BAAE; --color-sand-500:#A99C90;
  --color-ink-50:#F5F1EC; --color-ink-100:#E4DED7; --color-ink-200:#C9C2BA;
  --color-ink-300:#A39E98; --color-ink-400:#7C7873; --color-ink-500:#595959;
  --color-ink-600:#43413E; --color-ink-700:#2E2C2A; --color-ink-800:#232120;
  --color-ink-900:#1C1B19; --color-ink-950:#121110;
  --color-jade-500:#2F6B4F; --color-amber-500:#B07A14; --color-rust-500:#A32B21; --color-slateblue-500:#3B5C7A;
}
:root {
  --bg: var(--color-sand-50);         --surface: #FFFFFF;      --surface-sunken: var(--color-sand-100);
  --line: var(--color-sand-300);      --line-strong: var(--color-ink-300);
  --text: var(--color-ink-900);       --text-muted: var(--color-ink-500);  --text-inverse: var(--color-sand-50);
  --accent: var(--color-clay-500);    --accent-hover: var(--color-clay-600); --accent-contrast: #FFFFFF;
  --focus: var(--color-clay-400);
  --paid: var(--color-clay-500);      --house: var(--color-ink-900);       /* ad label colors */
  --radius-sm: 2px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px; --radius-full: 999px;
  --shadow-1: 0 0 0 1px var(--line);
  --shadow-2: 0 1px 2px rgb(28 27 25 / .06), 0 8px 24px -12px rgb(28 27 25 / .12);
  --shadow-3: 0 24px 64px -24px rgb(28 27 25 / .28);
  --ease: cubic-bezier(.2,.8,.2,1); --dur-fast: 120ms; --dur-base: 180ms; --dur-slow: 280ms;
  --z-header: 40; --z-overlay: 60; --z-toast: 80;
}
.dark {
  --bg: var(--color-ink-950); --surface: var(--color-ink-900); --surface-sunken: var(--color-ink-800);
  --line: var(--color-ink-700); --line-strong: var(--color-ink-600);
  --text: var(--color-sand-100); --text-muted: var(--color-ink-300); --text-inverse: var(--color-ink-950);
  --accent: var(--color-clay-400); --accent-hover: var(--color-clay-300); --accent-contrast: var(--color-ink-950);
  --focus: var(--color-clay-300); --house: var(--color-sand-100);
  --shadow-1: 0 0 0 1px var(--color-ink-700);
  --shadow-2: 0 1px 2px rgb(0 0 0 / .4), 0 8px 24px -12px rgb(0 0 0 / .6);
}
@theme inline {
  --color-bg: var(--bg); --color-surface: var(--surface); --color-surface-sunken: var(--surface-sunken);
  --color-line: var(--line); --color-text: var(--text); --color-muted: var(--text-muted);
  --color-accent: var(--accent); --color-accent-contrast: var(--accent-contrast);
  --font-sans: var(--font-inter); --font-display: var(--font-fraunces);
  --text-display-xl: clamp(2.5rem, 5vw, 4rem); /* + line-height tokens per §2.3 */
  --spacing-18: 4.5rem; --spacing-section: 6rem;
}
```

Spacing: 4 px base, steps 4/8/12/16/24/32/48/64/96. Section rhythm `py-16 md:py-24`. Radius: 2 badge, 8 field, 12 card, 16 panel/sheet, pill for tags and CTAs-in-carousel. Elevation: **three levels only** — `shadow-1` is a border, `shadow-2` is a card, `shadow-3` is a dialog. No shadow on hover; hover changes border color or background.

Motion: 120 ms for hover/press, 180 ms for popovers, 280 ms for sheets. Carousel cross-fade 600 ms. Transform + opacity only. `@media (prefers-reduced-motion: reduce)` sets durations to 0 and disables carousel autoplay.

### 2.5 Primitives

Thirteen files in `components/ui/`. Built on native platform elements, `clsx` (already installed). **No new UI dependency**: modal/sheet use `<dialog>` (focus trap, Esc, backdrop, inertness for free); select is a styled native `<select>` (best mobile UX, no list virtualization needed for 32 states); toast is one `aria-live="polite"` region.

| File | API | Notes |
|---|---|---|
| `button.tsx` | `variant: primary\|secondary\|ghost\|danger`, `size: sm\|md\|lg`, `loading`, `asChild`-free (`<Button as={Link}>` pattern not needed — export `buttonClass()` for links) | 44 px min height, `:focus-visible` ring |
| `input.tsx` | native input + error state | 16 px font on mobile (no iOS zoom) |
| `textarea.tsx` | native | auto-grow optional, off by default |
| `select.tsx` | native select + chevron | no JS |
| `field.tsx` | `label`, `hint`, `error`, `children` | wires `htmlFor` / `aria-describedby` / `aria-invalid` once, so forms stop re-rolling it |
| `card.tsx` | `as`, `interactive` | border, no shadow by default |
| `badge.tsx` | `tone: neutral\|success\|warning\|danger\|paid\|house` | `paid`/`house` exist for the ad product |
| `dialog.tsx` | `<dialog>` wrapper, `open`, `onClose`, `title` | `showModal()`, `::backdrop`, `@supports` fallback |
| `skeleton.tsx` | `lines`, `aspect` | replaces the per-page spinners (**C-12**) |
| `empty-state.tsx` | `title`, `description`, `action` | one voice, Spanish, always offers a next step |
| `error-state.tsx` | `title`, `onRetry` | the only place that renders failures (**C-12**) |
| `toast.tsx` | `ToastProvider`, `useToast()` | single region in root layout |
| `table.tsx` | `Table`, `Th`, `Td`, `TableEmpty` | admin + dashboard; `tabular-nums` |

No `Tabs` (use links), no `Accordion` (use `<details>`), no `Tooltip` (use `title` + visible label).

### 2.6 Page shells

**Public** (`(public)/layout.tsx`)
- Header: 64 px, sticky, `bg-surface/85 backdrop-blur`, hairline bottom border. Left: logo 132×33. Center: `Comprar` · `Rentar` · `Mapa`. Right: `Publicar propiedad` (primary button), theme toggle, session menu. Mobile: logo + `Publicar` + hamburger (native `<dialog>` sheet).
- Footer: 4 columns (`Explorar`, `Publicar`, `Legal`, `Contacto`) + bottom bar with © year, NOM-247 note, `Aviso de privacidad` · `Términos` · `Cookies` · `Reembolsos`.
- Content: `max-w-6xl` for editorial, `max-w-7xl` for listing/admin. Section spacing `py-16 md:py-24`. Route-line divider between major sections (1.5 px `--line-strong` with a 6 px dot at each end).
- SEO: every page exports `metadata` + `alternates.canonical`; JSON-LD only on detail (kept from today) and `Organization` on home.

**Dashboard** (`(app)/layout.tsx`)
- Left sidebar 240 px (`lg`), icons from `lucide-react`, grouped: *Resumen* · *Mis propiedades* · *Leads* (solicitudes, leads, CRM) · *Ofertas* · *Rentas* (solicitudes, contratos) · *Créditos* · *Agencia* (conditional) · *Ajustes*. Active item: clay 3 px left bar + `surface-sunken` background, no pill.
- Top bar 56 px: page title, credits balance chip, notification bell, avatar menu.
- Density: `small` type as base, 12 px cell padding, `tabular-nums` for money and counts. Same palette as public — denser, not a different brand (open question 5; default chosen).

**Admin** (`(admin)/layout.tsx`)
- No marketing chrome. Top bar 48 px with `ADMIN` overline badge, environment chip (`staging` / `producción`), and a link back to the public site.
- Sidebar 220 px, plain text labels, no icons.
- Table-first: sticky header row, row hover, status chips via `badge`. Numbers right-aligned, tabular.
- Server-side gate: `(admin)/layout.tsx` calls `getSession()`, requires `roles.some(r => r.type === "admin" && r.status === "approved")`, else `redirect("/")`. Backend still enforces (`requireAdmin`) — the layout guard is UX, not security.

### 2.7 Carousel / ad art direction

The carousel is inventory. It must look like a placement, not like a hero with ads in it.

**Frame.** Desktop 100vw × 520 px (`lg`), 440 px `md`, 4:5 portrait on mobile (100vw × 125vw, capped at 78vh). One slide visible, cross-fade 600 ms, 6 s dwell, pause on hover/focus/tab-hidden, arrows 44 px, dots bottom-center-right, `1/4` counter top-right.

**Overlay budget — four elements, no more.**
1. Top-left: slot label. `paid` → `PROMOCIONADO` (sand-100 pill, ink text, `overline`). `admin` → `DESTACADO` (outline pill). `house` → `CASA MX` (ink pill, sand text). Never all caps in serif, never an emoji (today uses 🔥).
2. Top-right: `1 / 4` in `caption` + pause/play 44 px.
3. Bottom-left: title (`display-m`, max 2 lines, `text-inverse`), price (`title`, tabular), location (`small`, `text-inverse/80`, single line, `colonia, ciudad`).
4. Bottom-right: CTA — `<button>` for paid slides (fires the click event then navigates), plain `<Link>` for admin/house.

Scrim: `linear-gradient(to top, rgb(18 17 16 / .88) 0%, rgb(18 17 16 / .55) 32%, rgb(18 17 16 / .12) 62%, transparent 100%)`, plus a top scrim `to bottom` 0→18% only when the slot label sits over bright sky. Text always sits on ≥ 55 % ink — verify 4.5:1 against the worst frame of each image in review.

**What is removed.** Today `FeaturedCarousel` paints a marketing CTA banner (“Publicar propiedad / Explorar propiedades”) on top of the paid slide. That is giving away the advertiser's visual budget. The marketing CTA becomes its own band below the carousel (`<PublicarBand />`), full width, sand background, one headline + one button. Paid slides keep 100 % of the frame.

**Mobile.** Portrait crop, no location line, title 2 lines max, CTA full-width 44 px at the bottom of the scrim, dots hidden (swipe + counter only).

**Attribution.**
- Impression: `IntersectionObserver` at ≥ 60 % visibility for 1 s, once per slot per page load, sent as one batched `POST /carousel/events` together with any clicks (`navigator.sendBeacon`).
- Click: on CTA, `sendBeacon` then navigate (no await, no blocked navigation).
- Never block render on beacons. No third-party analytics in the path (the existing `lib/analytics` stays for product events only).
- Every event carries `impressionId` from the slot payload, so an impression and its click join without cookies.

### 2.8 Dark mode

Keep it, but make it a token swap.

- `ThemeScript` (inline, ~350 bytes) in the root `<head>`: reads `localStorage.theme`, else `prefers-color-scheme`, sets `document.documentElement.classList`. Runs before paint → no flash. Delete the `useEffect` in `NavBar` that does this after hydration.
- `ThemeToggle` writes `localStorage.theme` and toggles the class. `color-scheme: light dark` on `:root` so native controls follow.
- No dark image variants. Photography is identical in both themes; the scrim does the work. This is why the logo pair is CSS-switched SVG, not `<Image>`.
- Contrast rule for dark: accent **buttons** use `clay-400` background with `ink-950` label (white on `clay-400` is 3.3:1 and fails). Links use `clay-300`. This is a rule, not a suggestion.

### 2.9 Accessibility targets

- Text ≥ 4.5:1, UI boundaries and icons ≥ 3:1, in both themes. Checked on the token pairs, not per component.
- `:focus-visible` ring: 2 px `--focus` + 2 px offset, visible on every interactive element, never removed.
- Targets ≥ 44×44 CSS px (nav, carousel controls, table row actions, mobile menu).
- Landmarks: one `<header>`, one `<main>`, one `<footer>` per shell; skip link first in tab order.
- Headings: one `<h1>` per page, no level skips. Screen-reader-only `<h1>` on home is allowed *only* if the carousel has no `<h1>` of its own (it does not — slides are `<h2>`).
- Carousel: `aria-roledescription="carrusel"`, each slide `aria-roledescription="diapositiva"` + `aria-label="1 de 4"`, no `aria-live` (it would read every rotation), pause control, ←/→ keys, swipe.
- Forms: every input labeled, errors announced via `aria-live="polite"` on the field, `aria-invalid`, error text tied with `aria-describedby`.
- `prefers-reduced-motion`: no autoplay, no transforms, no cross-fade (instant swap).
- axe in E2E: **0 serious or critical** on `/`, `/properties`, `/properties/[id]`, `/login`, `/register`, `/dashboard`, `/publish-property`.
---

## 3. Phased plan

Order: foundations → public (home+carousel, listing, detail) → auth → publish → dashboard → admin → cleanup/cutover.
Every phase: branch off `staging`, PR, CI green, staging URL verified, squash merge. Production untouched.

---

### Phase 0 — Foundations (size M)

**Goal.** A staging build where all 46 routes still work exactly as today, but the ground under them is new: route groups, tokens, fonts, brand assets, primitives, the type contract, and the two backend caching fixes. No user-facing behaviour change beyond a much smaller logo and a different font.

**Files**

Frontend — structure (pure `git mv`, separate commit, zero content edits):
- `app/layout.jsx` → `app/layout.tsx`
- all page dirs → `app/(public)/`, `app/(auth)/`, `app/(app)/`, `app/(admin)/` per §1.1
- `middleware.js` → `middleware.ts`
- new `app/(public)/layout.tsx`, `(auth)/layout.tsx`, `(app)/layout.tsx`, `(admin)/layout.tsx` hosting today's `NavBar` + footer + providers, so nothing regresses
- `components/DebugPanel.jsx`, `lib/debug/DebugContext.jsx` — **deleted** (removal list)

Frontend — foundations:
- `styles/tokens.css` (new), `app/globals.css` (shrink to `@import "tailwindcss"; @import "../styles/tokens.css";` + base)
- `lib/fonts.ts` — Fraunces + Inter, CSS vars
- `components/brand/Logo.tsx`, `Logomark.tsx`
- `components/theme/ThemeScript.tsx`, `ThemeToggle.tsx`
- `components/ui/*.tsx` — the 13 primitives
- `lib/cn.ts`, `lib/format.ts` + `lib/format.test.ts`
- `lib/api/client.js` → `client.ts` (typed, same behaviour)
- `lib/api/schema.d.ts`, `lib/api/types.ts` (generated, committed)
- `lib/api/queryClient.ts` — single `queryClient` with the C-10 defaults and a comment stating why (`staleTime 60s`, `refetchOnWindowFocus false`, `retry 1`); delete `lib/providers/QueryProvider.jsx` inline config so there is one source
- `scripts/gen-api-types.mjs`
- `public/brand/` — new SVG/PNG set per §2.2; old files moved to `docs/brand-source/`

Backend:
- `src/app.ts` — register `@fastify/compress`; issue `csrfToken` only on non-GET (C-04, C-05)
- `src/openapi/registry.ts`, `scripts/openapi.mjs`, `openapi.json` (committed), `GET /openapi.json` guarded to non-production
- `test/regression/promotions.test.ts` — assert (a) an expired promo is hidden by `publicPropertyView` (C-11), (b) `total` is still returned by `GET /properties` (the four existing assertions must stay green)

**Tasks**
1. Move routes. Run `next build`, then Playwright screenshot diff of `/`, `/properties`, `/properties/[id]`, `/login`, `/dashboard` against staging. Any visual diff must be zero.
2. Install tokens; replace `--font-family-sans` with `--font-sans`; delete DM Sans. Verify accent + diacritics render.
3. Produce brand assets. Measure total ≤ 20 KB. Wire `Logo` into the existing NavBar (17 lines replaced).
4. Build the 13 primitives. Direct imports from `components/ui/*.tsx`; no barrel file (a barrel turns one accidental `"use client"` into a page-wide client boundary).
5. Land the OpenAPI pipeline; generate `schema.d.ts`; add `"strict": true` to `tsconfig.json`; add `"typecheck": "tsc --noEmit"` to `package.json`.
6. Backend compress + CSRF-on-GET fix; deploy staging; verify headers.
7. Security headers: `middleware.ts` keeps CSP/HSTS/COOP/CORP/XFO byte-for-byte (they are a KEEP item). Self-hosted fonts mean no `fonts.gstatic.com` change; only add an image host if a new one appears. Diff the headers before/after with `curl -sI` and paste both in the PR.
8. Document the perf baseline in the PR (Lighthouse mobile, `/` and `/properties`).

**Acceptance**
- `curl -sI $API/properties` → `content-encoding: gzip|br`, **no** `set-cookie` header.
- Home page: total logo bytes ≤ 20 KB; HTML contains no `logo-light.png`/`logo-dark.png`.
- `npm run typecheck` exits 0; `npm test` green (69 existing + new format tests); E2E green.
- axe: 0 serious/critical on `/`, `/login`, `/properties`.
- Lighthouse mobile `/`: Perf ≥ 80 (deliberately not 90 — routes are still the old ones), A11y 100, SEO 100.
- Screenshot diff after the `git mv`: zero.
- `openapi.json` and `schema.d.ts` are committed and regenerate cleanly.

**Rollback.** Revert the merge; no DB migrations, no route behaviour changed. The `git mv` commit is isolated so structure can be reverted alone.

**Depends.** Nothing.

---

### Phase 1 — Home + carousel ad surface (size L)

**Goal.** `/` is server-rendered HTML, and the carousel becomes a four-slot ad product with explicit slot states, one data endpoint, real labeling and impression/click attribution. This is the revenue phase; treat it as a product, not a component.

**Files — backend**
- `prisma/schema.prisma`: `Property.carouselSlot Int?`, `Property.promotionStartedAt DateTime?`; `CarouselSlide.kind String @default("admin")` (`admin|house`), `startsAt DateTime?`, `endsAt DateTime?`; new `CarouselEvent`
- `prisma/migrations/<ts>_carousel_slots/migration.sql`: columns + `CREATE UNIQUE INDEX property_carousel_slot_unique ON "Property"("carouselSlot") WHERE "carouselSlot" IS NOT NULL;` (Prisma cannot express partial unique — raw SQL in the migration, or the slot race returns 409 wrongly)
- `src/services/carousel.service.ts` (new): `getSlots(now)`, `assignSlot(tx, userId)`, `recordEvents(batch)`
- `src/routes/carousel.ts` (rewrite `GET /carousel`, add `POST /carousel/events`, keep admin CRUD, add `kind`/`startsAt`/`endsAt` to the schemas)
- `src/routes/properties.ts`: `POST /properties/:id/promote` assigns `carouselSlot` inside the existing `$transaction`, clears expired slots first, returns `slotIndex`; new `GET /properties/carousel-slots` (auth) for the owner UI
- `src/openapi/registry.ts`: `CarouselResponse`, `CarouselSlot`, `CarouselEventBatch`
- `test/carousel.test.ts` (new)

**Files — frontend**
- `app/(public)/page.tsx` — server: `getCarousel()` + `getLatestProperties(6)`; renders `<Carousel slots={...}/>` or `<HeroEditorial/>`; `export const revalidate = 60`
- `components/public/carousel/Carousel.tsx`, `CarouselSlide.tsx`, `CarouselControls.tsx`, `useImpression.ts`, `tracking.ts`
- `components/public/home/{HeroEditorial,PublicarBand,ValueGrid,FeaturedStrip}.tsx`
- `components/property/PropertyCard.tsx` (new shared card, used here and in P2/P6)
- `lib/api/carousel.ts` (typed rewrite), `lib/server/carousel.ts`
- `app/_actions/revalidate.ts` — `"use server"` `revalidateProperty(id)`, `revalidateCarousel()`
- `app/(public)/aviso-legal|terminos|cookie|reembolsos|consent/page.tsx` — moved into the new shell (prose template `components/public/legal/Prose.tsx`)
- delete `components/HomepageCarousel.jsx`, `components/FeaturedCarousel.jsx`, `lib/api/carousel.js`

**Tasks**
1. Migration + service. Ordering: slots sorted by `carouselSlot` ASC, holes skipped, hard cap 4.
2. `GET /carousel` returns `{ slots, generatedAt }` with `kind` per slot (§6.2). `Cache-Control: public, max-age=30, s-maxage=60` (now honest after C-05).
3. Promote: inside the existing transaction, `updateMany` expired → `carouselSlot: null`, then lowest free index 0–3, then deduct credits. Failure modes unchanged: 402 insufficient, 403 not owner, 409 full, 404 missing.
4. Build the carousel island against §2.7. Server renders slide 1's markup so the LCP image and title exist without JS.
5. Attribution beacons, batched, `sendBeacon`, dedupe by `impressionId` in Redis `SETNX 5m`.
6. Rebuild home sections: `HeroEditorial` fallback (used when `slots.length < 2`), `PublicarBand`, `ValueGrid` (the five existing values, editorial two-column rhythm instead of five equal cards), `FeaturedStrip` (last 6 listings as server-rendered cards, no JS).
7. Restyle the five legal pages (they are prose; this is a shell change, not a rewrite).

**Acceptance**
- `curl -s $WEB/ | grep -c 'data-slot'` ≥ 1 — the first slide's title is in the HTML.
- With 0 promoted properties: no `PROMOCIONADO` label and no property deep-link inside the carousel; `HeroEditorial` or `house` slots only (E2E seeds the DB state).
- With 5 promoted properties: `GET /carousel` returns at most 4; the 5th promote returns 409 with the existing Spanish message.
- Expiry: a property with `featuredUntil` in the past frees its slot and disappears from `/carousel` (test).
- Race: two concurrent promotes get distinct slots, or one gets 409 — never the same index.
- One impression event per slide per load; one click event per CTA click. Playwright intercepts `/carousel/events` and asserts counts.
- Paid / admin / house labels are visually distinct and programmatically distinguishable (`data-kind`).
- Lighthouse mobile `/`: Perf ≥ 90, A11y 100, SEO 100, LCP ≤ 1.8 s, CLS ≤ 0.05, TBT ≤ 200 ms, route JS ≤ 150 KB gzip.
- axe 0 serious on `/`.

**Rollback.** Revert the merge. Migration is additive and nullable: `DROP INDEX`, `ALTER TABLE ... DROP COLUMN`, `DROP TABLE "CarouselEvent"` — keep that statement in the migration folder as `down.sql` (Prisma will not run it; it exists for a human). Old components come back with the revert.

**Depends.** Phase 0.

---

### Phase 2 — Listing (size L)

**Goal.** `/properties` ships page 1 in the HTML, filters stay URL-driven, and the query-param mirroring collapses to one field list. Map view keeps parity.

**Files**
- `app/(public)/properties/page.tsx` — server: `parseFilters(searchParams)`, `fetchProperties({...filters, limit: 12, offset: 0})` with `revalidate: 60`, render shell + islands
- `app/(public)/properties/map/page.tsx` — server shell + existing `components/map/PropertyMap.tsx`
- `components/public/listing/FilterPanel.tsx` (nuqs), `ListingResults.tsx` (`useInfiniteQuery` with `initialData` + `initialDataUpdatedAt`), `ListingToolbar.tsx`, `ActiveFilterChips.tsx`
- `lib/filters.ts` — `PROPERTY_FILTER_FIELDS: [urlKey, filterKey, kind][]`, `parseFilters`, `buildPropertyQuery` (C-16)
- `lib/api/properties.ts` (typed rewrite of `properties.js`), `lib/api/locations.ts` (replaces `locations.js`, C-19)
- `lib/server/properties.ts`, `lib/server/locations.ts`
- delete `app/properties/page.jsx`, `components/PropertyList.jsx`

**Tasks**
1. One field list drives both directions (URL → filters → querystring). Unknown keys are dropped by construction, not by a hand-maintained `if`.
2. Server fetch page 1; hand it to React Query as `initialData`. `getNextPageParam` derives from `offset + limit` vs `total` (the API already returns `total`) — stop guessing from `length < 12`.
3. Filters: same fields as today, but rendered with `field.tsx` + native controls; mobile filter sheet uses `<dialog>`.
4. Locations: one request to the unified catalog, typed, no `Promise.allSettled([oneThing])`, no `be.id || be.name || ""` (C-19).
5. Empty state (`empty-state.tsx`) distinguishes "no results for these filters" from "no listings in the country", with a *Limpiar filtros* action.
6. Error path: `filter-options` 500 → inline error + retry, never an empty filter panel (C-08).
7. Map page: reuse the existing Leaflet island; bounds write `swLat/…` into the URL exactly as today.

**Acceptance**
- `curl -s "$WEB/properties" | grep -c 'data-testid="property-card"'` == 12 (C-02 fixed).
- First paint issues exactly one `/properties` request (network assertion) and zero `/properties/filter-options` calls before interaction beyond the one server call.
- Unit test: `buildPropertyQuery({ foo: 1 })` produces no `foo` key; every key in the field list appears in the querystring when set.
- `?type=for_rent&estado=Jalisco` renders rent listings server-side (curl assertion).
- Mocked 500 on `filter-options` → visible `error-state` with `Reintentar`, not an empty panel.
- Back/forward restores filter state (E2E).
- Lighthouse mobile `/properties`: Perf ≥ 85, LCP ≤ 2.2 s, CLS ≤ 0.05, JS ≤ 180 KB gzip. axe 0.

**Rollback.** Revert. No backend changes.

**Depends.** Phase 0, Phase 1 (`PropertyCard`).

---

### Phase 3 — Property detail (size M)

**Goal.** The one page that is already server-rendered gets faster, cacheable, correctly typed, and its fake-404 path is gone. Owner preview moves to an authenticated route.

**Files**
- `app/(public)/properties/[id]/page.tsx` — typed, `revalidate = 300`, tag `property:<id>`, `notFound()` only on real 404, `generateMetadata` kept (canonical, OG), JSON-LD kept verbatim including the `<` escaping
- `app/(public)/properties/[id]/error.tsx`, `not-found.tsx`
- `components/property/detail/{Gallery,Summary,Description,Amenities,MapCard,OwnerCard,ContactCTA,Breadcrumbs}.tsx` — `Gallery` is the only client island
- `app/(app)/dashboard/my-properties/[id]/preview/page.tsx` — dynamic, authenticated, renders the same components with the owner's cookie
- `components/property/PropertyCard.tsx` reused
- delete `components/PropertyDetailContent.jsx`

**Tasks**
1. Public detail is public-only. If the listing is private or a draft, the API returns 404 → `notFound()`. Yes, even for its owner: the dashboard preview link is the owner's path (C-09).
2. Server fetch forwards **no** cookies and sets `next: { revalidate: 300, tags: [`property:${id}`] }`.
3. Gallery: keyboard-navigable, 44 px arrows, `loading="eager"` on the first image only, others lazy, `sizes="(max-width: 768px) 100vw, 66vw"`.
4. Contact CTA: for anonymous users, `Iniciar sesión para ver el contacto`; for authenticated, the existing credit-unlock flow — UI only, endpoint untouched.
5. Error split: 404 → `not-found.tsx`; 5xx/timeout → `error.tsx` with retry (C-08 final removal of the silent catch).
6. Keep JSON-LD `RealEstateListing` exactly as today, plus `BreadcrumbList`.

**Acceptance**
- Bogus id → HTTP 404 with `not-found` UI, not a 200 with a message.
- Second request to the same listing on staging returns `x-vercel-cache: HIT` and < 100 ms.
- Backend 500 (mocked in E2E) → `error.tsx` + retry, never "Propiedad no encontrada".
- Private listing: public route 404s; owner preview at `/dashboard/my-properties/<id>/preview` renders it.
- LCP ≤ 1.8 s mobile, CLS ≤ 0.05, JS ≤ 160 KB gzip, axe 0, JSON-LD parses.

**Rollback.** Revert. No backend changes.

**Depends.** Phases 0–2.

---

### Phase 4 — Auth (size M)

**Goal.** One session request instead of two plus a guaranteed 401, server-side guards in layouts, typed auth, and login/register on-brand.

**Files — backend**
- `src/routes/auth.ts`: `/auth/me` returns `avatarUrl`, `paidSubscriber`, `subscriptionStatus`, `subscriptionCurrentPeriodEnd` in addition to today's fields; set `cmx_session=1` (httpOnly false, same domain, same lifetime as the access cookie) on login/refresh/OAuth success; clear it on logout
- `src/openapi/registry.ts`: `MeResponse`, `LoginResponse`, `RegisterResponse`
- `test/auth/session.test.ts`

**Files — frontend**
- `app/(auth)/layout.tsx`, `login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`, `verify-email/page.tsx`
- `components/auth/{LoginForm,RegisterForm,ForgotForm,ResetForm,OAuthButtons}.tsx`
- `lib/auth/AuthProvider.tsx` (replaces `AuthContext.jsx`), `lib/auth/useAuth.ts`, `lib/server/session.ts` (`cache()`-wrapped `getSession()`), `components/public/SessionMenu.tsx`
- `app/(app)/layout.tsx`, `app/(admin)/layout.tsx`: real server guards
- `middleware.ts`: keep as the cookie-presence fast path only
- delete `lib/auth/AuthContext.jsx`, `getUserById` usage in hydration

**Tasks**
1. Extend `/auth/me`. Verify the four added fields come from the same query (no extra join cost worth worrying about).
2. `getSession()` in `lib/server/session.ts`: read `cookies()`, forward `Cookie` header, `cache: "no-store"`, return `MeResponse | null`. One call per request thanks to React `cache()`.
3. `AuthProvider` takes `initialUser`; `loading` is false on first render when the server already knows. No mount-time fetch inside `(app)`.
4. `SessionMenu`: `cmx_session` marker → one `/auth/me`; otherwise zero requests (**C-01**).
5. Login form: submit → cookies set by backend → `setUser` → `router.replace(redirect)` + `router.refresh()`. Logout: `POST /auth/logout`, clear context, `router.push("/")`, `router.refresh()`.
6. Role switch (`switchRole`) preserved as client state until the backend gains a real active-role endpoint — same behaviour as today, do not regress it.

**Acceptance**
- Logged-in hard navigation: exactly **1** `/auth/me` request. New visitor: **0**.
- No `401` in the console for anonymous visitors on `/`, `/properties`, `/properties/[id]`.
- `/dashboard` unauthenticated → `307` to `/login?redirect=/dashboard` **from the server** (curl, no JS).
- `/admin` authenticated as non-admin → `307` to `/`, and the backend still returns 403 for the API.
- Refresh rotation still works: force-expire the access cookie, make one mutation, assert one `/auth/refresh` then success.
- axe 0 on `/login`, `/register`; Lighthouse A11y 100.
- E2E: register → verify banner → login → logout, all green.

**Rollback.** Revert. Backend change is additive (extra response fields + one cookie). If `cmx_session` misbehaves, deleting it only costs the probe it was added to save.

**Depends.** Phases 0–1 (layouts).

---

### Phase 5 — Publish / upload (size L)

**Goal.** The 685-line upload form becomes a four-step wizard that survives a reload, and the last third-party photo dependency leaves the pipeline.

**Files**
- `app/(app)/publish-property/page.tsx` + `components/forms/property/{Wizard,StepBasics,StepLocation,StepDetails,StepPhotos,StepReview}.tsx`
- `lib/schemas/property.ts` — Zod per step, shared with the review step
- `lib/hooks/useDraftAutosave.ts` — `sessionStorage`, debounced 500 ms
- `app/(app)/upload/sale/page.tsx`, `app/(app)/upload/rental/page.tsx` → `redirect("/publish-property?tipo=...")`
- delete `components/PropertyUploadForm.jsx` (29.7 KB), `components/AddressSection.jsx` (28.8 KB), `components/property-form/*` superseded files
- `next.config.js`: remove `files.catbox.moe` from `remotePatterns`

**Tasks**
1. Steps: Datos básicos → Ubicación → Detalles → Fotos → Revisión. `useFormContext` across steps, one `useForm` in `Wizard`, per-step validation with `trigger([...fields])`.
2. Autosave draft to `sessionStorage`; `beforeunload` guard while dirty; restore with a visible "Borrador restaurado" toast.
3. Photos: existing R2 upload endpoint (`POST /properties/:id/images`) untouched; add drag-reorder that persists order; show upload progress; cap 20 photos, 20 MB each, client-side WebP compress kept.
4. Publish: `POST /properties/:id/publish`, then `revalidateProperty`, then `router.push(/properties/[id])` with a success toast.
5. Verify Catbox: `grep -rn "catbox" app components lib` → 0; confirm the R2 path is the only uploader.
6. Keep the INE gate: publishing without verification shows the existing verification CTA, not a dead end.

**Acceptance**
- Full publish E2E on staging: draft → 4 steps → review → published detail page.
- Reload mid-wizard restores every field and the photo set.
- Reordered photos persist after reload of the detail page.
- `grep -rn "catbox" .` (excluding docs/lockfiles) → 0.
- `/publish-property` route JS ≤ 200 KB gzip; axe 0; every error is announced (assert `aria-live` text in E2E).
- No client `xlsx` in the bundle (`next build` route size drops measurably).

**Rollback.** Revert. The API has no new endpoints, so old and new clients both work against the backend.

**Depends.** Phases 0, 4.

---

### Phase 6 — Dashboard (size L)

**Goal.** Every dashboard route renders its first data server-side, uses the primitives, and stops re-rolling loading/empty/error states. Credits, contracts, INE, offers, applications, agencies and referrals are restyled — **not** removed or re-scoped.

**Files**
- `app/(app)/dashboard/page.tsx` (overview: credits balance, active listings, new leads, pending offers)
- `dashboard/my-properties/`, `contact-requests/`, `leads/`, `crm/`, `offers/`, `my-offers/`, `applications/`, `rental-applications/`, `contracts/`, `agency/`, `integrations/`, `notifications/`, `shared/`, `account/`
- `app/(app)/settings/`, `credits/`, `requested/`, `properties/[id]/edit/`, `properties/import/`
- `components/app/{DashShell,Sidebar,Topbar,NotificationBell}.tsx`, `components/app/tables/*`
- `lib/api/credits.ts`, `contracts.ts`, `admin.ts`, `users.ts` (typed)
- backend: `POST /properties/import/parse` — accepts the file, parses with `xlsx` **server-side**, returns normalized rows; `src/openapi/registry.ts` additions
- delete client-side `xlsx` dependency from `package.json`; `components/PropertyImportWizard.jsx` rewritten as a 3-step server-validated flow

**Tasks**
1. Per route: server fetch → `initialData` → client table island for row actions. No full-page spinner (skeletons only for pagination).
2. Extract the three tables that already exist (offers, applications, properties) into `components/app/tables/` with the `table.tsx` primitive; do not build a generic data-grid.
3. Credits: balance, packages, purchase history, CFDI download — same endpoints, new shell.
4. Contracts: list + generate + download. Keep the state selector; do not touch PDF generation.
5. INE: upload + status timeline. Keep the existing admin-approval semantics.
6. Agency: members, invitations, membership plan. Same endpoints.
7. Import: parse server-side, show a preview table with per-row status, then bulk-create with the existing loop, now reporting progress from server responses.

**Acceptance**
- Each dashboard route's first data appears in the HTML (curl a sample: `/dashboard/my-properties` contains at least one row or the empty state, not a spinner).
- `grep -rn '"xlsx"' package.json` → absent; `npm ls xlsx` empty; import of a 100-row file succeeds on staging.
- No `neutral-*` Tailwind class in new files (`grep -rn "neutral-" app components` → 0 outside vendored code).
- axe 0 on `/dashboard`, `/dashboard/my-properties`, `/credits`.
- Transactions/offer/application/contract E2E specs green (they already exist — they must not be weakened).

**Rollback.** Revert per route group if needed; the routes are independent. Backend `/properties/import/parse` is additive.

**Depends.** Phases 0–5.

---

### Phase 7 — Admin (size M)

**Goal.** Admin is where the ad product is operated. Ship the 4-slot grid with live state, revenue and performance, plus the approvals/properties/analytics pages on the new shell.

**Files**
- `app/(admin)/admin/page.tsx` (overview), `analytics/`, `analytics/market/`, `approvals/`, `carousel/`, `properties/`, `agencies/`, `maps/`
- `components/admin/{CarouselSlotGrid,SlotCard,SlotEditor,PropertyReviewTable,AgencyTable,MetricsCards}.tsx`
- `lib/api/admin.ts` (typed)
- backend: `GET /admin/carousel/slots` (paid/admin/house/empty per index + 7-day impressions/clicks), `GET /admin/carousel/metrics?from&to`

**Tasks**
1. Slot grid: four cards indexed 0–3. Each shows `kind`, property title (or house slide title), owner/agency, `featuredUntil` countdown, credits spent, 7-day impressions, clicks, CTR. Empty card offers "Asignar contenido de la casa" (creates a `house` slide bound to that slot).
2. Slot editor: same form as today (image URL, title, subtitle, link, button text) plus `kind`, `startsAt`, `endsAt`, `active`.
3. Metrics: impressions/clicks/CTR per day from `CarouselEvent`, plus sold slot-days and credits from `CreditTransaction` where `type = "promotion"`.
4. Approvals/properties/agencies: keep behaviour, adopt `table.tsx`, add server-side pagination where the endpoint supports `limit/offset`.
5. Guard: `(admin)/layout.tsx` server check (Phase 4) + backend `requireAdmin` (unchanged).

**Acceptance**
- Grid shows exactly 4 slots and the correct state for each in a seeded staging DB (paid ×2, admin ×1, house ×1, then all-empty).
- CTR computed as clicks / impressions and matches a hand-computed value from the events table.
- Assigning a house slide to an empty slot changes `/carousel` output within 60 s (ISR) without a deploy.
- Admin route JS ≤ 180 KB gzip; axe 0 on `/admin/carousel`; non-admin gets 307 at the layout and 403 at the API.

**Rollback.** Revert. New endpoints are additive (`GET` only).

**Depends.** Phases 1, 4, 6.

---

### Phase 8 — Cleanup, upgrade, cutover (size M)

**Goal.** Delete everything on the removal list, hit the code-size targets, upgrade to Next 16 / React 19 on staging, and then — only with explicit approval — promote to production.

**Files**
- delete: `public/brand/*` legacy PNGs, `lib/api/*` thin modules (collapse to 10), `components/*` loose leftovers, `lib/stores/userStore.js` if unused after P6 (check first)
- `.opencode/skills/security-audit/SKILL.md` — rewrite against current code (it claims CSP disabled, CSRF missing, no password reset; all false)
- `README.md`, `docs/` — route map, token reference, ad product operation
- `next.config.js` — drop `images.remotePatterns` entries no longer used
- `package.json` — `next@16`, `react@19`, `react-dom@19`; remove `xlsx`

**Tasks**
1. Run the deletion list (§5) item by item, one commit each, `next build` after each.
2. Enforce the code gates (§8 metrics). Fix, don't exempt.
3. Next 16 + React 19 upgrade: bump, `next codemod`, fix `nuqs` adapter (`nuqs/adapters/next/app`), async `cookies()`/`searchParams` already handled in this plan, rebuild, run the full E2E suite.
4. One final full-suite run on staging: unit, integration, E2E, axe, Lighthouse.
5. Write the cutover note: what changed, what to watch, how to revert.

**Acceptance**
- All §8 code gates pass (§3 metrics table).
- `"use client"` files ≤ 35.
- Raw `fetch(` occurrences in `app/` + `components/` == 0 (only `lib/api/client.ts`, `lib/server/fetch.ts`).
- `toLocaleString(` in `app/` + `components/` + `lib/` == 0.
- `neutral-` classes == 0.
- Largest client chunk < 200 KB.
- Full E2E green on Next 16 + React 19.

**Rollback.** Each deletion is its own commit. The Next upgrade is a single commit that can be reverted independently of the deletions.

**Depends.** All previous phases.

**Cutover (separate, requires approval).** Merge `staging` → `main` only after the user says "merge to production" / "/deploy". Then: verify `/`, `/properties`, one detail page, login, one publish, one promote on production; watch Sentry + Railway logs for 30 min; keep the previous deployment ready to roll back in Vercel.

### Observability track (runs alongside P0–P2, not a separate phase)

**Errors — fix Sentry, do not replace it.**

Root cause verified 2026-10-18: no Sentry DSN was present in the production build (no `ingest.sentry.io` in any of the 15 initial chunks), so `enabled: Boolean(dsn)` made the SDK a silent no-op. The backend Sentry wiring is already correct.

- `instrumentation.js` now reads `SENTRY_DSN` (private) with `NEXT_PUBLIC_SENTRY_DSN` as fallback. Client reads the public var, which is inlined at build time.
- Set `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN` in Vercel (Production, Preview, Development). **Redeploy is required** — the client DSN is baked into the bundle.
- **Decision: self-hosted Bugsink.** It speaks the Sentry protocol, so the SDK stays and only the DSN changes. Stack lives in `ops/observability/` (Docker Compose + runbook). No per-seat or per-event billing.
- Why not the others: GlitchTip needs 4 containers and 1–2 GB RAM; self-hosted Sentry needs 20–40 containers and 16 GB+; the Sentry free tier is $0 but not self-hosted.
- Hosting: existing Docker host = $0; one Railway container = ~$5 (may fit plan credit); Oracle Cloud Always Free = $0 with self-managed ops. The only state is a Postgres volume; daily `pg_dump` documented in the runbook.
- Optional later: `withSentryConfig` from `@sentry/nextjs/config` for source maps and a tunnel route (ad-blocker bypass). Not required for error capture.
- Acceptance: throw a deliberate error on staging, see it in Sentry within 60 s, release tagged, email alert received.

**Analytics — activate the existing pipeline, add no vendor.**

The app already has `lib/analytics`, an `AnalyticsEvent` table, an aggregation service, five admin endpoints, and an admin dashboard. It is switched off (`NEXT_PUBLIC_ANALYTICS_ENABLED=false`) and barely instrumented (3 call sites: login, register, referral; `PageView` and `PropertyViewed` are defined but never fired). `POST /analytics/events` also requires JWT, so anonymous traffic cannot be counted.

- Enable: `NEXT_PUBLIC_ANALYTICS_ENABLED=true`, `NEXT_PUBLIC_ANALYTICS_PROVIDER=api`.
- Backend: make `POST /analytics/events` optional-auth — attach `userId` when a valid JWT is present, otherwise accept anonymously with an IP rate limit, server-side timestamp, and **no PII**. Never store IP, email, or document data in `metadata`.
- Instrument the funnel: `PageView` (route change), `PropertyViewed`, `SearchPerformed`, `ListingContactClicked`, `LeadUnlocked`, `OfferMade`, `ContractGenerated`, `CarouselImpression`, `CarouselClick` (P1), `ReferralClick`.
- Carousel impressions/clicks feed the P7 revenue/CTR grid. This is the ad product's measurement layer.
- No third-party analytics in P0–P8. Revisit Umami (self-hosted traffic) or PostHog (session replay/funnels) only if marketing attribution needs it later; it must stay consent-gated.
- Acceptance: after 24 h on staging, `/admin/analytics` shows non-zero page views, property views, and carousel impressions from an anonymous session.

---

## 4. Fix backlog — every C-item, one phase each

| ID | Problem | Phase | Change | Acceptance check |
|---|---|---|---|---|
| **C-01** | Auth waterfall: `/auth/me` then `/users/:id`, 401 for anonymous | **4** | Add 4 fields to `/auth/me`; hydrate from one response; delete `getUserById` from hydration; `cmx_session` marker skips the probe for new visitors | Logged-in hard nav = 1 `/auth/me`; new visitor = 0; no 401 on public pages |
| **C-02** | Listing client-rendered | **2** | Server component fetches page 1 with `revalidate: 60`; `initialData` seeds the infinite query | `curl /properties` contains 12 `property-card` nodes |
| **C-03** | Oversized raster logo (two optimizer requests; Next already caps client weight) | **0** | SVG wordmark pair + mono, CSS-switched, ≤ 20 KB total, correct intrinsic size | One logo request; ≤ 20 KB; no PNG logo in HTML |
| **C-04** | API responses uncompressed | **0** | `@fastify/compress` (gzip + br, threshold 1024) | `content-encoding` present on `/properties` |
| **C-05** | CSRF cookie on public GETs makes cache headers meaningless | **0** | Issue `csrfToken` only on non-GET; keep enforcement unchanged | No `set-cookie` on `GET /properties`; mutation with CSRF still 200 |
| **C-06** | Carousel priority falls back to free listings | **1** | Explicit `paid` / `admin` / `house` states, `data-kind`, labeled house content, `HeroEditorial` when unsold | 0 promoted → no `PROMOCIONADO`, no unpaid deep-link in carousel |
| **C-07** | Carousel fetched three ways | **1** | One `GET /carousel` returning ≤ 4 ordered slots | One carousel request per page load (network assertion) |
| **C-08** | Silent catch renders fake 404 / empty filters | **2** | `ApiError` + `error.tsx`; 404 only on real 404; `filter-options` failure shows retry | Mocked 500 → error UI, never "no encontrada" / empty panel |
| **C-09** | Detail uncached and cookie-blind | **3** | Public-only + ISR 300 s; owner preview at `/dashboard/my-properties/[id]/preview` | Second hit `x-vercel-cache: HIT`; owner preview works; private listing 404s publicly |
| **C-10** | No shared query defaults | **0** | One `lib/api/queryClient.ts` with documented defaults; consumers stop overriding | `grep -rn "new QueryClient"` == 1 |
| **C-11** | Backend writes on every listing read | **0** | Already fixed in backend `353aba7`; add regression test, keep `total` | `publicPropertyView` hides expired promo; 4 `total` assertions green |
| **C-12** | Error/loading/empty re-rolled per page | **0** | `skeleton.tsx`, `empty-state.tsx`, `error-state.tsx`; adopted in P2/P3/P6 | Route files contain no hand-rolled spinner markup |
| **C-13** | `logo-mark.png` declared as `image/svg+xml` | **0** | Real `favicon.svg` + correct types in metadata | Metadata JSON has no type mismatch; no 404 on icon |
| **C-14** | DM Sans declared, never loaded; wrong Tailwind key | **0** | Fraunces + Inter via `next/font`, `--font-sans` namespace, DM Sans deleted | No `font-family-sans`; no `"DM Sans"` anywhere; headings render Fraunces |
| **C-15** | No type contract | **0** | Zod → OpenAPI → `openapi-typescript` → committed `schema.d.ts`; `strict: true` | `npm run typecheck` clean; every new endpoint in the registry |
| **C-16** | 36 duplicated query-param appends | **2** | One `PROPERTY_FILTER_FIELDS` list drives parse + build | Unit test: unknown keys dropped, known keys emitted |
| **C-17** | `toLocaleString` in 53 places | **0** | `lib/format.ts` (`formatMoney`, `formatDate`, `formatArea`, `formatPhone`) + tests; adopt during cutover | `toLocaleString(` count == 0 in `app/ components/ lib/` at P8 |
| **C-18** | 49 loose files in `components/` | **8** | Feature folders per §1.7; only extraction that removes duplication | No file at `components/` root except `ErrorBoundary.tsx` / `FooterYear.tsx` if still used |
| **C-19** | Locations merge defensive and verbose | **2** | Typed single fetch, no `allSettled`, no `be.x \|\| be.y \|\| ""` | `grep allSettled lib/` == 0; catalog renders with one request |

Note on C-11: the review's fix is already deployed. Phase 0 only adds the regression test — do not "re-fix" it.

---

## 5. Removal backlog

| Item | Deleted in | Note |
|---|---|---|
| `components/HeroCarousel.jsx` | already gone (`60c009f`) | Phase 0 re-verifies: `grep -rn HeroCarousel` == 0 |
| `public/brand/logo-test.png` | **P0** | Moved to `docs/brand-source/`, not shipped |
| `logo-horizontal`, `logo-stacked`, `logo-primary`, `logo-icon`, `logo-light`, `logo-dark` PNGs | **P0** | Replaced by 4 SVGs; source art stays in `docs/brand-source/` |
| `DebugProvider` + `DebugPanel` from root layout | **P0** | Ship-time JS removed; debug UI for devs moves behind the admin maps page if still needed |
| Client-side `xlsx@0.18.5` | **P6** | Parsing moves to `POST /properties/import/parse`; dependency removed in P8 |
| Catbox photo re-hosting | **P5** | Verify `grep -rn "catbox"` == 0, remove `remotePatterns` entry, confirm R2 is the only path |
| Stale `.opencode/skills/security-audit/SKILL.md` | **P8** | Rewritten against current code (CSP exists, CSRF enforced, password reset exists) |
| 28 thin `lib/api/*` files | **P8** | Collapsed to ≤ 10 domain modules; each phase rewrites its own, P8 deletes the remainder |
| Duplicate inline SVG/emoji icons | **P8** | `lucide-react` already installed; sweep at the end, not mid-phase |

Rule: nothing is deleted before the route that uses it is cut over. A deletion commit never touches behaviour.

---

## 6. Carousel / ad product plan

This is the revenue surface: 4 slots × 20 credits/day. Four is the pricing lever — the plan keeps it hard-capped and makes each slot an assignable, reportable, sellable thing.

### 6.1 Data model (backend, Phase 1)

```prisma
model Property {
  // ...
  carouselSlot        Int?      // 0..3 while a carousel promo is active; NULL otherwise
  promotionStartedAt  DateTime? // when the current promotion was purchased
  // existing: promotionTier String?, featuredUntil DateTime?
}

model CarouselSlide {
  // existing: id, imageUrl, title, subtitle, link, buttonText, order, active, timestamps
  kind      String    @default("admin") // "admin" | "house"
  slot      Int?      // when kind = "house" and bound to a specific index
  startsAt  DateTime?
  endsAt    DateTime?
}

model CarouselEvent {
  id            String   @id @default(uuid())
  impressionId  String
  type          String   // "impression" | "click"
  slot          Int
  kind          String   // "paid" | "admin" | "house"
  propertyId    String?
  slideId       String?
  createdAt     DateTime @default(now())
  @@index([createdAt])
  @@index([propertyId, createdAt])
  @@index([impressionId, type])
}
```

Constraints:
- `CREATE UNIQUE INDEX ... ON "Property"("carouselSlot") WHERE "carouselSlot" IS NOT NULL` — the only real guarantee against double-selling slot 2.
- Slot is freed in the **promote transaction** (`updateMany` where `featuredUntil <= now` → `carouselSlot: null`), never on read. Reads stay free of writes (keeps C-11's spirit).
- Purging `CarouselEvent` older than 180 days: one cron-less `DELETE` in the existing maintenance path, or leave it — the table is small. If left, write it down as `shortcut:` in the service.

### 6.2 One endpoint

`GET /carousel` — public, no auth, no cookies.

```json
{
  "slots": [
    {
      "slot": 0,
      "kind": "paid",
      "impressionId": "b0f0…",
      "propertyId": "8c1e…",
      "title": "Casa en Roma Norte",
      "imageUrl": "https://images.casa-mx.com/…/1.webp",
      "href": "/properties/8c1e…",
      "ctaLabel": "Ver propiedad",
      "listingType": "for_rent",
      "priceLabel": "$32,000 /mes",
      "locationLabel": "Roma Norte, Cuauhtémoc",
      "sponsor": { "name": "Agencia Roma" },
      "endsAt": "2026-11-02T18:00:00.000Z"
    },
    { "slot": 2, "kind": "house", "impressionId": "…", "title": "Cómo negociar una contraoferta", "imageUrl": "…", "href": "/guia/contraofertas", "ctaLabel": "Leer guía" }
  ],
  "generatedAt": "2026-10-18T12:00:00.000Z"
}
```

- **Max 4 slots.** Holes are allowed (sold slot 0 and 3 → two slides). Never fabricate a slide to fill a hole.
- Ordering: `slot ASC`. No client-side sorting, no client-side fallback chain (C-07).
- `Cache-Control: public, max-age=30, s-maxage=60`.
- `impressionId` is generated per response, one per slot, and is the join key for its own click.
- `priceLabel`/`locationLabel` are formatted server-side (`formatMoney`, `es-MX`) so the client never re-derives currency.

`POST /carousel/events` — public, batched, max 50 events, `rateLimit: 120/min/IP`:
```json
{ "events": [ { "impressionId": "…", "type": "impression" }, { "impressionId": "…", "type": "click" } ] }
```
Dedupe `(impressionId, type)` in Redis with `SET NX EX 300` before insert. Always `204`, even on partial failure — analytics must never break a navigation.

### 6.3 Slot states

| State | Who sets it | Label | Fill rule |
|---|---|---|---|
| `paid` | owner buys via `POST /properties/:id/promote` (20 credits/day) | `PROMOCIONADO` | occupies its assigned index until `featuredUntil` |
| `admin` | admin-curated `CarouselSlide` (`kind = "admin"`, optional `slot`, `startsAt`/`endsAt`) | `DESTACADO` | fills the lowest empty index, then any empty index |
| `house` | CASA MX editorial (`kind = "house"`, evergreen: guides, contract explainers, market notes) | `CASA MX` | fills remaining; max 4 house slides total |
| empty | — | — | if `< 2` slides total, the page renders `HeroEditorial` (static, no carousel chrome) and no slot labels |

Non-negotiable: **an unpaid listing never appears in the carousel.** This is the whole point of C-06. The old chain (custom → paid → most-viewed → latest 6) is deleted.

### 6.4 Purchase flow (owner)

1. Dashboard → property → "Promocionar".
2. `GET /properties/carousel-slots` → `{ free: [1,3], pricePerDay: 20, maxDays: 30 }`.
3. UI shows the price honestly: `20 créditos × N días = X créditos`; if `free.length === 0`, the CTA is disabled with "El carrusel está lleno. Te avisamos cuando se libere un espacio" and a notify-me action (reuses tag notifications).
4. `POST /properties/:id/promote { tier: "carousel", days }` → `{ cost, slotIndex, featuredUntil }`.
5. Dashboard card shows: "Espacio 1 · vence el 2 de noviembre · 14 impresiones · 3 clics" once events exist.

### 6.5 Admin tooling (Phase 7)

- 4-card grid, index-labelled, drag to swap admin/house content only (paid slots are not draggable — the buyer paid for position).
- Per-slot 7-day impressions / clicks / CTR, revenue in credits, days remaining.
- Create/edit house slides (the four evergreen pieces), with `startsAt`/`endsAt` scheduling.
- Kill switch: `active = false` on a paid property → slot freed, credits **not** refunded automatically (refund stays a manual credit transaction, as today).

### 6.6 Attribution reporting

- Impressions: 60 % visible for 1 s, once per slot per page load.
- Clicks: CTA only (not the whole slide) — makes CTR comparable to ad-platform numbers.
- Admin reads `CarouselEvent` grouped by day and slot; the sold-slot count comes from `Property.carouselSlot IS NOT NULL`; revenue from `CreditTransaction` where `type = "promotion"` and `referenceId = propertyId`.
- No user identifiers, no cookies, no cross-site tracking. `impressionId` is random and dies with the response.

---

## 7. Risks and open questions

### Principal risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Cookie domain vs Vercel preview hostnames.** Auth cookies are set for `.casa-mx.com`; a `*.vercel.app` preview cannot receive them, so SSR auth in previews silently fails | Auth phases look broken in preview URLs | Use a custom staging domain (`staging.casa-mx.com`) for all verification, and set `FRONTEND_URL`/`NEXT_PUBLIC_API_URL` per environment. Verify in Phase 0 before any auth work |
| **ISR staleness on detail** (5 min) | A sold/rented listing can look available for up to 5 min | Mutations call `revalidateProperty`; the badge is server-rendered so a refresh fixes it. Acceptable for a marketplace; revisit if it isn't |
| **SVG trace fidelity** if no vector source exists | Logo looks wrong at 32 px | Trace at 2× and hand-correct; fall back to the 21 KB `@2x` PNG for the wordmark. Never redraw the symbol |
| **`<dialog>` quirks** on older iOS Safari | Modal/sheet mispositioned | `@supports` fallback to a fixed overlay; test on iOS 16 in BrowserStack before P4 |
| **Next 16 + React 19 upgrade** | `nuqs` adapter, async params, third-party libs | Upgrade last (P8), single commit, full E2E. Nothing earlier depends on it |
| **Slot race** with Prisma's lack of partial unique indexes | Two buyers get slot 2 | Raw partial unique index in the migration + retry-on-conflict + 409 |
| **Public nav flashes anonymous** for logged-in users | Perceived quality | Reserve 40×40 skeleton, probe resolves in one request; measure CLS ≤ 0.05 |
| **Agency/owner role switching** is client-only today | Server guards may disagree with the UI's active role | Keep today's behaviour; server guards use `roles[]`, not `activeRole`. Do not "improve" this mid-rebuild |

### Decisions (confirmed 2026-10-18)

| # | Question | Decision | Consequence for the plan |
|---|---|---|---|
| 1 | Real carousel advertisers today? | **No — inventory is unsold.** | Build bought + house + empty states from day one. Do not assume sold inventory |
| 2 | Unsold slots: house content or collapse? | **House content, labelled `CASA MX`, and one of the four house slides is the ad-sales slide** ("Anuncia tu propiedad aquí — 4 espacios al mes"). Never fill a slot with free listings; that devalues the product and makes CTR reporting meaningless. Collapse to a static hero only when fewer than 2 slides exist in total | Phase 1 hero must render three states: sold, partially sold, fully house |
| 3 | Vector logo source? | **Unconfirmed — check for `.ai` / `.svg` / `.eps` once.** If none exists, redraw the mark as clean SVG paths from `logo-primary@2x.png` (1536×512, 21 KB); do not auto-trace. Wordmark is reset as live text so it stays crisp | Phase 0 asset task, 1 day; fallback is the existing 21 KB `@2x` PNG |
| 4 | Dark mode requirement? | **Not a requirement.** It is not a WCAG requirement and it doubles visual QA. Ship light-first; keep the semantic tokens so dark is a token swap, and move the toggle to Phase 8 | Removes dark-mode work from Phases 0–7 and one client island from the root layout |
| 5 | Dashboard feel? | **Same brand, denser.** Same palette and type, smaller base size, more table per screen, less whitespace | Affects density tokens only; no separate design language |
| 6 | Canonical staging URL? | **`staging.casa-mx.com` + `api.staging.casa-mx.com`.** Checked 2026-10-18: `staging.casa-mx.com` resolves to Vercel (64.29.17.65) but returns **404 — no alias attached**, so staging is not currently reachable. A `*.vercel.app` preview cannot work for auth: `deriveCookieDomain()` yields `.staging.casa-mx.com`, and a cookie with that domain **cannot be set by a response from `api.casa-mx.com`** (invalid domain, browser rejects it). The API must live at `api.staging.casa-mx.com` so the shared cookie domain is valid | Phase 0 blocker: attach the domain in Vercel, add the Railway domain, set `FRONTEND_URL=https://staging.casa-mx.com`, `NEXT_PUBLIC_API_URL=https://api.staging.casa-mx.com`, add the origin to `CORS_EXTRA_ORIGINS` if needed |
| 7 | Who writes the house slides? | **We do.** Four evergreen Spanish slides: (a) "Publica gratis y llega a compradores verificados", (b) "Contratos con validez legal en tu estado", (c) "Verificación INE: tratos con confianza", (d) the ad-sales slide from decision 2. Art built from existing brand assets, no stock photography | Phase 1 content task; admin carousel already supports swapping slides later |

---

## 8. Definition of done

### Per-phase gate (all must pass before merge to `staging`)

1. **Typecheck**: `npm run typecheck` exits 0. New/rewritten files are `.ts`/`.tsx` with `strict: true`. Old JS untouched and still builds.
2. **Unit/integration**: `npm test` green. New non-trivial logic (filters, slot assignment, formatting, events) has a test.
3. **E2E**: `npm run test:e2e` green, including the specs for the routes in the phase.
4. **Accessibility**: axe on every route the phase touches → 0 serious, 0 critical. Keyboard-only pass on the primary action of the page.
5. **Lighthouse** (mobile preset, 3 runs, median) on the phase's public routes:

| Route | Perf | A11y | SEO | LCP | CLS | INP | Route JS (gzip) |
|---|---|---|---|---|---|---|---|
| `/` (after P1) | ≥ 90 | 100 | 100 | ≤ 1.8 s | ≤ 0.05 | ≤ 200 ms | ≤ 150 KB |
| `/properties` (after P2) | ≥ 85 | 100 | 100 | ≤ 2.2 s | ≤ 0.05 | ≤ 200 ms | ≤ 180 KB |
| `/properties/[id]` (after P3) | ≥ 90 | 100 | 100 | ≤ 1.8 s | ≤ 0.05 | ≤ 200 ms | ≤ 160 KB |
| `/login`, `/register` (after P4) | ≥ 95 | 100 | — | — | ≤ 0.02 | — | ≤ 80 KB |
| `/publish-property` (after P5) | — | 100 | — | — | ≤ 0.05 | — | ≤ 200 KB |
| `/admin/*` (after P7) | — | 100 | — | — | — | — | ≤ 180 KB |

6. **Staging verification**: the URL from the PR is checked by hand — primary flow works, console clean, no new 4xx/5xx in Railway logs for 15 minutes after the smoke run.
7. **No production change**: `main` is untouched. The only thing that reaches production is the final, explicitly approved merge.

### Whole-rebuild gates (Phase 8)

| Metric | Now | Target |
|---|---|---|
| `"use client"` files | 110 | ≤ 35 |
| Raw `fetch(` in `app/` + `components/` | 67 across the tree | 0 (only `lib/api/client.ts`, `lib/server/fetch.ts`) |
| `useEffect`-based data fetching | 69 | 0 in new/rewritten code |
| `toLocaleString(` | 53 | 0 |
| `neutral-*` Tailwind classes | pervasive | 0 |
| Largest client chunk | 414 KB | < 200 KB |
| Logo bytes per page | 1.28 MB | ≤ 20 KB |
| API compression | none | gzip/br on all JSON |
| `lib/api/*` modules | 24 | ≤ 10 |
| `components/` root files | 48 | ≤ 2 |

### Production promotion

Never automatic. The user must say "merge to production" / "push to live" / "/deploy". At that point:

1. Confirm staging has been green for the whole phase.
2. Merge `staging` → `main`, let Vercel + Railway deploy.
3. Smoke: `/`, `/properties`, one detail, login, one publish, one carousel promote, one admin slot view.
4. Watch Sentry + Railway logs for 30 minutes.
5. If anything fails: roll back the Vercel deployment to the previous build (instant), then fix forward on `staging`.

If a production hotfix is ever made on `main` during the rebuild, merge it into `staging` immediately — a diverged `staging` makes the final cutover unsafe.
