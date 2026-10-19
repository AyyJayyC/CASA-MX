# TDD Evidence — CSRF bootstrap (C-05)

**Date:** 2026-10-19
**Source plan:** `docs/REBUILD_PLAN.md` → Phase 0, fix C-05
**Repos:** frontend `casa-mx` (`staging`), backend `casa-mx-backend` (`staging`)

## User journeys

1. As a visitor on a fresh browser, I want my first save/publish/upload to succeed, so I don't get a mysterious 403.
2. As a visitor, I want public listing pages to be cacheable, so the site is fast for everyone.
3. As a logged-in user returning after my session cookie expired, I want my next mutation to re-establish CSRF automatically.

## Why this changed

`GET /properties` was issuing `Set-Cookie: _csrf` and `csrfToken` on every response. That makes `Cache-Control: public, s-maxage=60` unusable — no shared cache stores a response that sets cookies. Issuing tokens on requests with side effects only, plus an explicit bootstrap, makes the public API cacheable without breaking mutations.

## RED evidence

| Repo | Command | Result |
|---|---|---|
| Frontend | `npx vitest run tests/lib/client-csrf.test.js` | **4 failed / 2 passed** — `ensureCsrfToken` did not exist |
| Backend | `npx vitest run tests/csrf-protection.test.ts` | **2 failed / 4 passed** — `GET /auth/csrf` returned 404; `GET /health` still set cookies |

Checkpoint commits: `768f45d` (frontend test), `6606b91` (backend test).

## GREEN evidence

| Repo | Command | Result |
|---|---|---|
| Frontend | `npx vitest run tests/lib/client-csrf.test.js tests/lib/client.test.js` | **13/13 passed** |
| Frontend | `npm test` | **824/824 passed**, 96 files |
| Backend | `npx vitest run tests/csrf-protection.test.ts` | **6/6 passed** |
| Backend | `npm test` | **432/432 passed**, 52 files |
| Backend | `npx tsc --noEmit` | exit 0 |

Checkpoint commits: `673f9a4` (frontend fix), `cf8da2a` (backend fix).

## Live verification (Docker)

Rebuilt `casamx-backend` and hit the running container:

```
GET /properties?limit=50
HTTP/1.1 200 OK
cache-control: public, s-maxage=60, stale-while-revalidate=300
content-encoding: br
            ← no set-cookie

GET /auth/csrf
HTTP/1.1 204 No Content
cache-control: no-store
set-cookie: _csrf=...; Path=/; HttpOnly; Secure; SameSite=Lax
set-cookie: csrfToken=...; Path=/; Secure; SameSite=Lax
```

## Test specification

| # | Guarantee | Test | Type | Result |
|---|---|---|---|---|
| 1 | A mutation with no token fetches `/auth/csrf` once, then sends `x-csrf-token` | `tests/lib/client-csrf.test.js` | unit | PASS |
| 2 | GET never triggers the bootstrap | same | unit | PASS |
| 3 | An existing token skips the bootstrap request | same | unit | PASS |
| 4 | Concurrent mutations share one bootstrap request | same | unit | PASS |
| 5 | FormData uploads bootstrap before sending | same | unit | PASS |
| 6 | `ensureCsrfToken()` resolves true without a request when the cookie exists | same | unit | PASS |
| 7 | Public GET responses set no cookies | `tests/csrf-protection.test.ts` | integration | PASS |
| 8 | `GET /auth/csrf` returns 204, both cookies, `no-store` | same | integration | PASS |
| 9 | A mutation without a token is rejected | same | integration | PASS |
| 10 | A mutation with the issued token is accepted | same | integration | PASS |

## Coverage and known gaps

- Frontend coverage was not re-measured for this slice; the changed code (`lib/api/client.js`) is covered by both the existing and new client tests.
- The bootstrap failure path (network error) returns `false` and lets the request proceed; the server's 403 is the caller's signal. Not asserted in a test.
- `README`/docs for the backend route are unchanged; the OpenAPI contract work (Phase 0, task 5) will document it.

## Merge evidence

RED → GREEN → live-verified. If these commits are squashed, keep this summary in the PR body:

> CSRF tokens are now issued on mutations only. Clients bootstrap through `GET /auth/csrf`. Public GETs no longer set cookies, making `s-maxage=60` on `/properties` usable. Verified in Docker: `content-encoding: br`, no `set-cookie` on `/properties`; 204 + both cookies on `/auth/csrf`. Frontend 824/824, backend 432/432.
