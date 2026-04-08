# CASA MX — Status & Release Notes

## Current Project Status
- Status: ✅ Feature complete
- Last Updated: April 8, 2026
- Canonical long-form documentation: `COMPLETE_PROJECT_DOCUMENTATION.md`

## Final Validated Metrics
- Backend tests: **230/230 passed**
- Frontend tests: **66/66 passed**
- Playwright E2E: **33/33 passed**
- Frontend build: ✅ `npm run build`
- Backend build: ✅ `npm run build`

## Launch Readiness Notes
- Code quality gate is green after the April 8 validation rerun.
- Frontend auth now uses cookie-first session handling instead of browser-stored tokens.
- The live publish-flow Playwright spec now supports production targeting through `PLAYWRIGHT_BASE_URL` and `PLAYWRIGHT_API_URL`.
- Public deployment check found the frontend is not fully up to date: `casa-mx.com` is reachable, but the footer legal links are missing and `/privacy`, `/terms`, `/cookie` currently return 404.
- Remaining release work is operational and configuration-focused, not feature-focused.
- Use `docs/PRODUCTION_LAUNCH_CHECKLIST_2026-04-08.md` for the current production cutover checklist.

## Phase 4 Highlights
- Frontend migrated to API-backed auth/users/properties/analytics flows
- Users endpoints completed: `GET /users/me`, `PATCH /users/me`, `GET /users/:id`
- Admin approvals wired to backend role-approval endpoints
- Analytics provider switched to backend API and admin analytics page uses backend data
- E2E and integration hardening completed (including no-skips policy)
- Property publish UX upgraded with gallery previews, card-style property type selection, amenity/service selectors, and smarter numeric input handling

## Release Notes (Latest)
### 2026-04-08
- Revalidated frontend, backend, and Playwright suites to a full green state
- Revalidated backend runtime health with Docker-backed services
- Updated production launch guidance to reflect current environment and auth topology requirements
- Hardened frontend auth to rely on secure cookies and removed browser token persistence from the main auth flow
- Parameterized the live publish-flow Playwright spec so it can run against `casa-mx.com` and `api.casa-mx.com`

### 2026-03-10
- Removed conditional test skips and stabilized suites
- Updated docs to final no-skip validated state
- Production builds verified for both frontend and backend

## Operational Pointers
- Setup/run: `README.md`, `SERVER_MANAGEMENT.md`
- Architecture/details: `COMPLETE_PROJECT_DOCUMENTATION.md`
- Prompt artifacts retained: `PHASE*_MASTER_PROMPT.md`, transition files, and strategy docs
