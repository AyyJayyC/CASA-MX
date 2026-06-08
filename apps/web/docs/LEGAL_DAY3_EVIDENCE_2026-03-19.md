# Legal Day 3 Evidence

Date: 2026-03-19
Scope: `casa-mx` frontend legal minimum

## Delivered
- Added policy routes:
  - `/privacy`
  - `/terms`
  - `/cookie`
- Added global footer links (visible site-wide) in root layout to:
  - Privacy
  - Terms
  - Cookies
- Added required registration consent checkbox for Terms + Privacy acceptance before account creation.

## Files Changed
- `app/privacy/page.js`
- `app/terms/page.js`
- `app/cookie/page.js`
- `app/layout.js`
- `app/register/page.jsx`
- `tests/components/RegisterPage.test.jsx`
- `tests/e2e/integrity.spec.ts`

## Validation
```bash
npm run build
npm test
npm audit --omit=dev --audit-level=high
```

Results:
- Build: **PASS** (route manifest includes `/privacy`, `/terms`, `/cookie`)
- Tests: **PASS** (`18` files, `53` tests)
- Security dependency gate: **PASS** (`0` high vulnerabilities)

Consent-path validation:
- Register page now blocks submit unless legal consent checkbox is checked.
- Component test updated to verify successful registration with consent selection.

## Remaining Compliance Work
- Persist and audit consent acceptance metadata at backend/data layer (currently UI capture + validation in frontend path).
