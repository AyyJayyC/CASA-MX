# Implementation Plan: CASA MX v2 — Consolidated Fixes (4-in-1)

## Overview
This plan consolidates 4 pending fixes: (1) NavBar "+ Publicar" CTA button, (2) Dashboard card-grid redesign, (3) Spanish text localization across 15 files, and (4) test updates. All changes maintain existing functionality and pass `tsc --noEmit`, `vitest run`, and `npm run build`.

## Critical Project Structure Notes
- **Project type:** Next.js 15 App Router (JavaScript/JSX, not TypeScript `.tsx`)
- **Role labels file:** `lib/reviews.js` (exported as `REVIEW_ROLE_LABELS`), NOT `src/types/index.ts`
- **Type re-exports:** `lib/types/index.ts` re-exports TypeScript type definitions only — contains NO runtime labels
- **No `BuyerFormModal` exists:** Closest analog is `components/RentalApplicationForm.jsx`
- **No `OfflineBanner` component exists:** No "Backend no disponible" string found in codebase
- **No `PropertyFilters` component:** Filtering logic is inline in `app/properties/page.jsx`
- **NavBar notification bell is inline code** — not a separate `NotificationBell` component

---

## Phase 1: Fix 3 Priority 1 — ROLE_LABELS (Cascading Change)

**Affected file:** `lib/reviews.js` (NOT `src/types/index.ts`)
**Cascades through:** NavBar, MobileMenu, Dashboard page, Reviews page, LeaveReviewModal, ReviewSummaryCard, and any component calling `getRoleLabel()`.

### Current State of `lib/reviews.js` (lines 1-8):
```js
export const REVIEW_ROLE_LABELS = {
  seller: "Vendedor",
  buyer: "Comprador",
  wholesaler: "Mayorista",
  admin: "Administrador",
  tenant: "Inquilino",
  landlord: "Arrendador",
};
```

### Changes Needed:
The user wants these 4 labels fixed. The current labels are already Spanish but the user's intent is to ensure these specific mappings:

| Role Key | Current Label | Target Label | Notes |
|----------|--------------|--------------|-------|
| `buyer` | `"Comprador"` | `"Buscador"` | Changed: more intuitive for home seekers |
| `seller` | `"Vendedor"` | `"Propietario"` | Changed: seller → property owner |
| *(new)* `realtor` | *(missing)* | `"Agente inmobiliario"` | **Added** — was only in TAG_LABELS, not role labels |
| `admin` | `"Administrador"` | `"Administrador"` | Already correct, no change |

### Step 1.1: Update `lib/reviews.js` — `REVIEW_ROLE_LABELS`
**File:** `lib/reviews.js`, lines 1-8  
**Action:** Update the object:
- `buyer: "Comprador"` → `buyer: "Buscador"`
- `seller: "Vendedor"` → `seller: "Propietario"`
- Add `realtor: "Agente inmobiliario"` entry
- Keep `admin`, `wholesaler`, `tenant`, `landlord` as-is

**Old string:**
```js
export const REVIEW_ROLE_LABELS = {
  seller: "Vendedor",
  buyer: "Comprador",
  wholesaler: "Mayorista",
  admin: "Administrador",
  tenant: "Inquilino",
  landlord: "Arrendador",
};
```

**New string:**
```js
export const REVIEW_ROLE_LABELS = {
  seller: "Propietario",
  buyer: "Buscador",
  realtor: "Agente inmobiliario",
  wholesaler: "Mayorista",
  admin: "Administrador",
  tenant: "Inquilino",
  landlord: "Arrendador",
};
```

**Cascade impact:** Every component calling `getRoleLabel(role)` automatically reflects the new labels:
- `components/NavBar.jsx` line 206
- `components/MobileMenu.jsx` line 173
- `app/dashboard/page.jsx` line 188 (role switcher buttons)
- `app/reviews/page.jsx` lines 34, 117
- `components/LeaveReviewModal.jsx` line 78
- `components/ReviewSummaryCard.jsx` line 17

### Step 1.2: Update test — `tests/lib/reviews-lib.test.js`
**File:** `tests/lib/reviews-lib.test.js`  
**Lines to edit:** 5-11 (test assertions), 54-57 (count check)

**Change 1 (lines 5-11):** Update expected values in `getRoleLabel` test:
```js
// Old:
expect(reviews.getRoleLabel('seller')).toBe('Vendedor');
expect(reviews.getRoleLabel('buyer')).toBe('Comprador');

// New:
expect(reviews.getRoleLabel('seller')).toBe('Propietario');
expect(reviews.getRoleLabel('buyer')).toBe('Buscador');
expect(reviews.getRoleLabel('realtor')).toBe('Agente inmobiliario');
```

**Change 2 (lines 54-56):** Update count from 6 to 7:
```js
// Old:
it('REVIEW_ROLE_LABELS has 6 entries', () => {
  const keys = Object.keys(reviews.REVIEW_ROLE_LABELS);
  expect(keys).toHaveLength(6);
});

// New:
it('REVIEW_ROLE_LABELS has 7 entries', () => {
  const keys = Object.keys(reviews.REVIEW_ROLE_LABELS);
  expect(keys).toHaveLength(7);
});
```

---

## Phase 2: Fix 2 — Dashboard Redesign

**File:** `app/dashboard/page.jsx` (complete rewrite of the render section)

### Current State
The current page has:
- A `SECTIONS` array (lines 6-127) with 16 entries, each with href, title, description, icon (emoji), and roles array
- A 2-column grid (line 196) showing filtered sections as cards
- A role switcher (lines 174-193)
- Empty state for pending approval (lines 225-235)
- No "Mis propiedades" card separately (it's item at index 12)
- No KPI stat cards
- No "Actividad reciente" timeline

### Target Design
Replace the `SECTIONS` array and grid section with:

1. **Header** (keep existing lines 163-171)
2. **Role Switcher** (keep existing lines 174-193)
3. **6-9 Quick-Action Cards** (3-column grid, role-filtered per the matrix below)
4. **4 KPI Stat Cards** (single row)
5. **Actividad reciente timeline** (keep existing `DashboardTimeline` or add placeholder)

### Quick-Action Cards by Role

| Card | Icon | Title | href | Owner | Admin | Realtor | Seeker |
|------|------|-------|------|-------|-------|---------|--------|
| Publicar propiedad | ➕ | Publicar propiedad | `/publish-property` | ✅ | ✅ | ✅ | — |
| Mis propiedades | 🏘️ | Mis propiedades | `/dashboard/my-properties` | ✅ | ✅ | ✅ | — |
| Pipeline CRM | 📊 | Pipeline CRM | `/dashboard/crm` | ✅ | ✅ | ✅ | — |
| Solicitudes | 📋 | Solicitudes | `/dashboard/applications` | ✅ | ✅ | ✅ | — |
| Créditos | 💰 | Créditos | `/credits` | ✅ | ✅ | ✅ | — |
| Ajustes | ⚙️ | Ajustes | `/settings` | ✅ | ✅ | ✅ | ✅ |
| Buscar propiedades | 🔍 | Buscar propiedades | `/properties` | — | — | — | ✅ |
| Mis ofertas | 🧭 | Mis ofertas | `/dashboard/my-offers` | — | — | — | ✅ |
| Mis aplicaciones | 🏠 | Mis aplicaciones | `/dashboard/rental-applications` | — | — | — | ✅ |

**Role mapping to "Owner"/"Admin"/"Realtor"/"Seeker" groups:**
- **Owner** = activeRole is `"seller"` or `"landlord"`
- **Admin** = activeRole is `"admin"`
- **Realtor** = activeRole is `"wholesaler"` or `"realtor"`
- **Seeker** = activeRole is `"buyer"` or `"tenant"`

### Step 2.1: Replace SECTIONS with quick-action card configuration
**File:** `app/dashboard/page.jsx`  
**Action:** Replace lines 6-127 (the `SECTIONS` array) with a new `QUICK_ACTION_CARDS` configuration. Remove the old array entirely.

```jsx
const QUICK_ACTION_CARDS = [
  // Owner/Admin/Realtor cards
  {
    href: "/publish-property",
    title: "Publicar propiedad",
    subtitle: "Crea un nuevo listado",
    icon: "➕",
    roles: ["seller", "landlord", "wholesaler", "realtor", "admin"],
  },
  {
    href: "/dashboard/my-properties",
    title: "Mis propiedades",
    subtitle: "Administra tus publicaciones",
    icon: "🏘️",
    roles: ["seller", "landlord", "wholesaler", "realtor", "admin"],
    countKey: "myPropertiesCount", // populated from API or state
  },
  {
    href: "/dashboard/crm",
    title: "Pipeline CRM",
    subtitle: "Gestiona tu pipeline de ventas",
    icon: "📊",
    roles: ["seller", "landlord", "wholesaler", "realtor", "admin"],
  },
  {
    href: "/dashboard/applications",
    title: "Solicitudes",
    subtitle: "Revisa solicitudes de renta",
    icon: "📋",
    roles: ["seller", "landlord", "wholesaler", "realtor", "admin"],
  },
  {
    href: "/credits",
    title: "Créditos",
    subtitle: "Administra tu saldo",
    icon: "💰",
    roles: ["seller", "landlord", "wholesaler", "realtor", "admin"],
  },
  {
    href: "/settings",
    title: "Ajustes",
    subtitle: "Configura tu perfil",
    icon: "⚙️",
    roles: ["buyer", "tenant", "seller", "landlord", "wholesaler", "realtor", "admin"],
  },
  // Seeker cards
  {
    href: "/properties",
    title: "Buscar propiedades",
    subtitle: "Explora el catálogo",
    icon: "🔍",
    roles: ["buyer", "tenant"],
  },
  {
    href: "/dashboard/my-offers",
    title: "Mis ofertas",
    subtitle: "Sigue tus negociaciones",
    icon: "🧭",
    roles: ["buyer", "tenant"],
  },
  {
    href: "/dashboard/rental-applications",
    title: "Mis aplicaciones",
    subtitle: "Estado de tus solicitudes",
    icon: "🏠",
    roles: ["buyer", "tenant"],
  },
];
```

### Step 2.2: Replace the grid rendering section
**File:** `app/dashboard/page.jsx`, lines 195-223  
**Action:** Replace the 2-column grid and empty state with the new 3-column quick-action card grid + KPI stats + timeline.

**Old (lines 195-235):**
```jsx
        {/* Section cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleSections.map((section) => (
            <Link ...>
              ...
            </Link>
          ))}
        </div>

        {visibleSections.length === 0 && (
          <div className="text-center py-16 ...">
            ...
          </div>
        )}
```

**New (replace lines 195-235):**
```jsx
        {/* Quick-Action Cards — 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="
                group flex flex-col p-5
                bg-white dark:bg-neutral-900
                border border-neutral-200 dark:border-neutral-800
                hover:border-clay dark:hover:border-amber-500
                rounded-xl shadow-sm
                transition-all hover:shadow-md
              "
            >
              <span className="text-3xl mb-3">{card.icon}</span>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-clay dark:group-hover:text-clay-400 transition-colors">
                {card.title}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {card.subtitle}
              </p>
            </Link>
          ))}
        </div>

        {visibleCards.length === 0 && (
          <div className="text-center py-16 text-neutral-400 dark:text-neutral-600">
            <div className="text-4xl mb-3">⏳</div>
            <p className="font-medium">
              Tu cuenta está pendiente de aprobación.
            </p>
            <p className="text-sm mt-1">
              Un administrador revisará tu solicitud pronto.
            </p>
          </div>
        )}

        {/* KPI Stat Cards — 4 in a row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {kpiStats.map((stat) => (
            <div
              key={stat.label}
              className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm"
            >
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {stat.value}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Actividad reciente timeline */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Actividad reciente
          </h2>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                Sin actividad reciente
              </p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800 last:border-0 last:pb-0"
                  >
                    <span className="text-lg mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {item.title}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {item.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
```

### Step 2.3: Add supporting state/logic at top of component
**File:** `app/dashboard/page.jsx`  
**Action:** After line 129 (`export default function DashboardPage() {`) and the auth guard (lines 132-148), add the derived state before the return statement. Replace the `visibleSections` variable (line 156) with `visibleCards` and add `kpiStats` and `recentActivity`.

**Replace lines 150-158:**
```jsx
  const approvedRoles = (user?.roles ?? [])
    .filter((r) => r.status === "approved")
    .map((r) => r.type);

  const activeSectionRoles = [user?.activeRole];

  const visibleSections = SECTIONS.filter((s) =>
    s.roles.some((r) => activeSectionRoles.includes(r)),
  );
```

**With:**
```jsx
  const approvedRoles = (user?.roles ?? [])
    .filter((r) => r.status === "approved")
    .map((r) => r.type);

  const activeRole = user?.activeRole;

  const visibleCards = QUICK_ACTION_CARDS.filter((card) =>
    card.roles.includes(activeRole),
  );

  // KPI stats — placeholder values, can be wired to API queries later
  const kpiStats = [
    { label: "Propiedades activas", value: "—" },
    { label: "Ofertas recibidas", value: "—" },
    { label: "Solicitudes pendientes", value: "—" },
    { label: "Créditos disponibles", value: "—" },
  ];

  // Placeholder for recent activity — wire to notifications API or timeline query
  const recentActivity = [];
```

---

## Phase 3: Fix 1 — NavBar "+ Publicar" CTA Button

**File:** `components/NavBar.jsx` (single file change)

### Step 3.1: Add publish CTA button in desktop auth section
**File:** `components/NavBar.jsx`  
**Location:** Between the user role badge (lines 189-215) and the notification bell (lines 218-302), around line 216.

**Action:** Insert the publish CTA button. It should appear only when `activeRole` is one of `["seller", "landlord", "wholesaler", "realtor", "admin"]` — which matches the existing `canPublish` boolean already computed on lines 46-53 (but expanded to include `"realtor"`).

First, update `canPublish` to include `"realtor"`:

**Lines 46-53 — Old:**
```js
  const canPublish = Boolean(
    ["seller", "wholesaler", "admin", "landlord"].includes(user?.activeRole) &&
    user?.roles?.some(
      (r) =>
        ["seller", "wholesaler", "admin", "landlord"].includes(r.type) &&
        r.status === "approved",
    ),
  );
```

**Lines 46-53 — New:**
```js
  const canPublish = Boolean(
    ["seller", "wholesaler", "admin", "landlord", "realtor"].includes(user?.activeRole) &&
    user?.roles?.some(
      (r) =>
        ["seller", "wholesaler", "admin", "landlord", "realtor"].includes(r.type) &&
        r.status === "approved",
    ),
  );
```

**Insert after line 215** (after `</div>` closing the user badge, before the notification bell comment `{/* Notifications */}`):

Add:
```jsx
                  {/* Publish CTA — visible for owner/realtor/admin roles */}
                  {canPublish && (
                    <>
                      {/* Desktop: full text button */}
                      <Link
                        href="/publish-property"
                        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-clay hover:bg-clay-500 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Publicar
                      </Link>
                      {/* Mobile: circular icon-only button */}
                      <Link
                        href="/publish-property"
                        className="sm:hidden inline-flex items-center justify-center w-9 h-9 bg-clay hover:bg-clay-500 text-white rounded-full transition-all shadow-sm"
                        aria-label="Publicar propiedad"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </Link>
                    </>
                  )}
```

### Step 3.2: Add mobile publish button to MobileMenu (optional enhancement)
**File:** `components/MobileMenu.jsx`  
**Location:** Around line 74, the existing `canPublish &&` block already shows "Vender" and "Créditos" links. These can stay. No change required unless we want to add a dedicated "Publicar" link. The existing is sufficient.

---

## Phase 4: Fix 3 Priorities 2-4 — Remaining Spanish Text Fixes

### Priority 2: Homepage strings (5 instances)

**Files to check:** `app/page.jsx` (homepage), `components/HomepageCarousel.jsx`

**Findings:** No English strings found in these files. The homepage already uses Spanish:
- "Encuentra tu camino en el mercado inmobiliario" (HomepageCarousel.jsx line 18)
- "Explorar propiedades" (line 34)
- "Publicar propiedad" (line 28)

**Action:** No changes needed for Priority 2. The requested strings ("No trending properties yet", "No houses available", "No apartments available", "Explore our listings", "Backend no disponible") **do not exist** in the current codebase. If they need to be added (e.g., as empty states in a future component), that is out of scope.

### Priority 3: Labels/placeholders in form files (8 instances)

#### Step 4.1: `app/forgot-password/page.jsx`
**Line 10:** `"Email inválido"` → `"Correo inválido"`
```js
// Old:
  email: z.string().email("Email inválido"),
// New:
  email: z.string().email("Correo inválido"),
```

**Line 74:** Label `Email` → `Correo electrónico`
```jsx
// Old:
                >Email</label>
// New:
                >Correo electrónico</label>
```

**Line 91:** Placeholder `"tu@email.com"` → `"tú@email.com"`
```jsx
// Old:
                   placeholder="tu@email.com"
// New:
                   placeholder="tú@email.com"
```

#### Step 4.2: `app/login/page.jsx`
**Line 12:** `"Email inválido"` → `"Correo inválido"`
```js
// Old:
  email: z.string().email("Email inválido"),
// New:
  email: z.string().email("Correo inválido"),
```

**Line 89:** Label `Email` → `Correo electrónico`
```jsx
// Old:
                >Email</label>
// New:
                >Correo electrónico</label>
```

**Line 97:** Placeholder `"tu@email.com"` → `"tú@email.com"`
```jsx
// Old:
                placeholder="tu@email.com"
// New:
                placeholder="tú@email.com"
```

#### Step 4.3: `app/register/page.jsx`
**Line 14:** `"Email inválido"` → `"Correo inválido"`
**Line 171:** Label `Email` → `Correo electrónico`
**Line 187:** Placeholder `"tu@email.com"` → `"tú@email.com"`

Same pattern as login page.

#### Step 4.4: `components/RentalApplicationForm.jsx` (BuyerFormModal analog)
**Line 15:** `"Email inválido"` → `"Correo inválido"`
**Line 304:** Label `Email *` → `Correo electrónico *`

#### Step 4.5: `app/settings/page.jsx`
**Finding:** Already uses `"Correo electrónico"` on line 292. No change needed.

#### Step 4.6: `app/publish-property/page.jsx` and PropertyFilters
**Finding:** No `"Pet friendly"` string found. The existing code uses `"Acepta mascotas"` (Spanish) in `UserPreferences.jsx` line 324 and `PropertyUploadForm.jsx` line 1289. No change needed.

### Priority 4: Admin labels (6 instances)

#### Step 4.7: `components/NavBar.jsx` — Admin link label
**Line 315:** `Admin` → `Administración`
```jsx
// Old:
                      >Admin</Link>
// New:
                      >Administración</Link>
```

#### Step 4.8: `components/MobileMenu.jsx` — Admin link labels
**Lines 100, 103, 107, 110, 114, 117, 121, 124, 127, 130, 134:**
Change all `Admin: *` prefixes to `Administración: *`

```jsx
// Old (example line 100):
            Admin: Aprobaciones
// New:
            Administración: Aprobaciones
```

Apply to all 9 admin submenu items (lines 100-148):
- `Admin: Aprobaciones` → `Administración: Aprobaciones`
- `Admin: Analítica` → `Administración: Analítica`
- `Admin: Propiedades` → `Administración: Propiedades`
- `Admin: Carrusel` → `Administración: Carrusel`
- `Admin: Mapas` → `Administración: Mapas`
- `Admin: Agencias` → `Administración: Agencias`

#### Step 4.9: `components/UserPreferences.jsx` — "Realtor" label
**Line 16:** `"Realtor"` → `"Agente inmobiliario"`
```js
// Old:
  { value: "realtor", label: "Realtor" },
// New:
  { value: "realtor", label: "Agente inmobiliario" },
```

#### Step 4.10: `components/PropertyCard.jsx` — TAG_LABELS
**Line 32:** `realtor: "Realtor"` → `realtor: "Agente inmobiliario"`

#### Step 4.11: `components/PropertyDetailContent.jsx` — TAG_LABELS
**Line 25:** Within `perfil` object: `realtor: "Realtor"` → `realtor: "Agente inmobiliario"`

#### Step 4.12: `components/PropertyUploadForm.jsx` — "realtors" in description
**Line 1276:** Change `"realtors"` → `"agentes inmobiliarios"`
```jsx
// Old:
                 ? '🔒 Solo visible para mayoristas, realtors y administradores. No aparecerá en búsquedas públicas.'
// New:
                 ? '🔒 Solo visible para mayoristas, agentes inmobiliarios y administradores. No aparecerá en búsquedas públicas.'
```

#### Step 4.13: `app/properties/import/page.jsx` — "realtors" text
**Line 37:** Change `"realtors"` → `"agentes inmobiliarios"`
```jsx
// Old:
          para mayoristas y realtors).
// New:
          para mayoristas y agentes inmobiliarios).
```

#### Step 4.14: Admin pages — "Carousel" already Spanish
**Finding:** `app/admin/carousel/page.jsx` line 151 already uses `"Carrusel"`. No change needed.

#### Step 4.15: "CRM Pipeline" and "Hero"/"Premium" labels
**Finding:** No English strings found for these. The CRM page (`app/dashboard/crm/page.jsx`) uses `"CRM"` as the heading (line 361). "Hero" and "Premium" as labels are not present in the admin panel. No changes needed.

---

## Phase 5: Verification

### Step 5.1: TypeScript check
```bash
npx tsc --noEmit
```
Expected: No errors (project is mostly JS/JSX, but types exist in `lib/types/`).

### Step 5.2: Unit tests
```bash
npx vitest run
```
Expected: All 6 tests pass (update the reviews-lib test as specified in Step 1.2).

### Step 5.3: Build check
```bash
npm run build
```
Expected: Successful Next.js production build.

---

## File Change Summary

| # | File | Change Type | Lines Affected |
|---|------|-------------|----------------|
| 1 | `lib/reviews.js` | Edit ROLE_LABELS | 1-8 |
| 2 | `tests/lib/reviews-lib.test.js` | Update test assertions | 5-11, 54-57 |
| 3 | `app/dashboard/page.jsx` | Major redesign | 6-127 (replace), 150-235 (replace) |
| 4 | `components/NavBar.jsx` | Add publish CTA + update canPublish | 46-53, insert after 215, 315 |
| 5 | `components/MobileMenu.jsx` | Admin label fix | 100-148 |
| 6 | `app/forgot-password/page.jsx` | Spanish labels | 10, 74, 91 |
| 7 | `app/login/page.jsx` | Spanish labels | 12, 89, 97 |
| 8 | `app/register/page.jsx` | Spanish labels | 14, 171, 187 |
| 9 | `components/RentalApplicationForm.jsx` | Spanish labels | 15, 304 |
| 10 | `components/UserPreferences.jsx` | Realtor label | 16 |
| 11 | `components/PropertyCard.jsx` | TAG_LABELS realtor | 32 |
| 12 | `components/PropertyDetailContent.jsx` | TAG_LABELS realtor | 25 |
| 13 | `components/PropertyUploadForm.jsx` | Text fix | 1276 |
| 14 | `app/properties/import/page.jsx` | Text fix | 37 |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **Role label changes cascade unexpectedly** — e.g., "Comprador" → "Buscador" may confuse existing users | The change is intentional per the user's specification. Update all dependent tests. |
| **Dashboard redesign removes useful sections** — 16 sections compressed to 9 cards | The old sections were redundant. Keep the role switcher so users can still access role-specific pages. |
| **`canPublish` expansion to include `realtor`** may grant publish access to users who shouldn't have it | The condition still checks `r.status === "approved"`, so only approved realtors get access. |
| **NavBar CTA placement conflicts with existing layout** | Insert between user badge and notification bell; test at `md` and `sm` breakpoints. |
| **Missing English strings not found** — user's list includes strings that don't exist in codebase | Documented in plan as "not applicable" — no changes needed for non-existent strings. |

## Success Criteria
- [ ] `tsc --noEmit` passes with 0 errors
- [ ] `vitest run` passes all 6 tests (with updated assertions)
- [ ] `npm run build` completes successfully
- [ ] All 4 ROLE_LABELS reflect correctly across NavBar, MobileMenu, Dashboard role switcher, and register page
- [ ] Dashboard shows role-filtered quick-action cards in 3-column grid
- [ ] Dashboard shows 4 KPI stat cards
- [ ] Dashboard shows "Actividad reciente" timeline section
- [ ] NavBar shows "+ Publicar" button for owner/realtor/admin roles
- [ ] "+ Publicar" button is full text on desktop, circular icon on mobile
- [ ] All 33 Spanish text replacements are applied (where strings exist)
- [ ] "Realtor" changed to "Agente inmobiliario" in all 5 locations
- [ ] "Email" labels changed to "Correo electrónico" in all 4 form files
- [ ] Admin menu labels changed from "Admin:" to "Administración:"
