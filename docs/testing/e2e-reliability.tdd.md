# TDD Evidence — E2E reliability + `/auth/me` rate limit

**Date:** 2026-10-19
**Repos:** frontend `casa-mx`, backend `casa-mx-backend` (`staging`)
**Environment:** local frontend `:3000` + Docker backend `:3001` (`casamx` DB), Playwright Chromium

## User journeys

1. As a logged-in user, I want to keep browsing past 30 pages without being silently logged out.
2. As a developer, I want `npx playwright test` to be green locally, not only in CI.
3. As a security reviewer, I want the adversarial E2E tests to exercise the same CSRF path real clients use.

## Root causes found

| Symptom | Cause |
|---|---|
| 8–9 E2E failures, "redirected to /login" with a token present | `GET /auth/me` was capped at **30 requests / 15 min**, and it runs on every page load. Real users hit this too, not just tests |
| Different failures between runs | `playwright.config.js` used **4 workers** locally; the suite shares one backend, one DB and 3 seeded users |
| Integrity test got 201 for invalid input | It never sent a CSRF header; the 201 only happened when security was disabled |
| Live upload test failed on a disabled button | It clicked a submit button that the form correctly disables, and its final assertion was `expect(x \|\| true)` (always true) |

## RED evidence

```
npx vitest run tests/auth-me-rate-limit.test.ts
  × does not rate-limit session hydration after 35 page loads
  expect(statuses.filter((s) => s === 429)).toHaveLength(0)
  → 5 requests returned 429
```

## GREEN evidence

| Command | Result |
|---|---|
| `npx vitest run tests/auth-me-rate-limit.test.ts` | **1/1 passed** |
| `npx vitest run tests/csrf-protection.test.ts` | 6/6 passed |
| `npx playwright test` (full suite, serial) | **66/66 passed, 5.2 min** |
| `npx tsc --noEmit` (backend) | exit 0 |

## Changes

- `/auth/me` limit: `30` → `test 500 / local 1000 / production 300` per 15 min.
- Playwright: `workers: 1` everywhere (CI already did).
- Integrity spec: bootstraps `GET /auth/csrf` after login and sends `x-csrf-token`.
- Live upload spec: now asserts the form loads and accepts a title; removed the disabled-button click and the always-true assertion.

## Test specification

| # | Guarantee | Test | Type | Result |
|---|---|---|---|---|
| 1 | 35 session hydrations do not 429 | `tests/auth-me-rate-limit.test.ts` | integration | PASS |
| 2 | A mutation without a CSRF token is rejected | `tests/csrf-protection.test.ts` | integration | PASS |
| 3 | A mutation with the issued token succeeds | `tests/csrf-protection.test.ts` | integration | PASS |
| 4 | Admin, owner and client flows load authenticated pages | `tests/e2e/*-flow.spec.ts` | E2E | PASS |
| 5 | Invalid application input is rejected with 400 | `tests/e2e/integrity.spec.ts` | E2E | PASS |
| 6 | Sale upload form opens for an authenticated owner | `tests/e2e/00-upload-live.spec.ts` | E2E | PASS |

## Known gaps

- The full publish path (photos + map address) still has no E2E; it is covered by backend tests and by the form smoke test.
- E2E still depends on the local backend being seeded with `admin123`/`seller123`/`buyer123`. CI gets that from `tests/setup.ts`; local dev needs the same passwords (documented in `ops/observability`? No — pending a line in the E2E README).
- Staging verification still needs `staging.casa-mx.com` attached (Vercel) and `api.staging.casa-mx.com` on Railway.

## Merge evidence

> `/auth/me` no longer logs users out after 30 page loads (300/15 min in production, 1000 locally). Playwright runs serially and the adversarial suite now sends CSRF. Full E2E: 66/66. Backend: 432/432 + new rate-limit regression.
