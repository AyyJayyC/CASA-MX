# Frontend Security Audit Baseline

Date: 2026-03-19
Scope: `casa-mx` (production dependencies)

## Baseline (Before Remediation)
Command:
- `npm audit --omit=dev --audit-level=high`

Result:
- High vulnerabilities: **1** (`next`)
- Advisory family included SSRF/DoS/cache poisoning/image optimizer issues on vulnerable Next.js ranges.

## Remediation Performed
- Upgraded `next` from `^13.4.0` to `^15.5.14`.
- Performed clean dependency reinstall after Windows file-lock corruption during upgrade.
- Updated server component dynamic imports in `app/properties/[id]/page.js` by removing `{ ssr: false }` from client component imports (required by Next 15 server component rules).

## Verification (After Remediation)
- `npm audit --omit=dev --audit-level=high` -> **0 vulnerabilities**
- `npm run build` -> **PASS** (Next.js 15.5.14 build complete)
- `npm test` -> **PASS** (`18` files, `53` tests)

## Status
- Frontend dependency security gate: **PASS**
- Frontend build gate: **PASS**
- Frontend test gate: **PASS**
