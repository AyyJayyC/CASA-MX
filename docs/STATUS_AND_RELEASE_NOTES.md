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
- Public deployment smoke check is now green after the frontend redeploy.
- Authenticated production publish validation is now green with an approved seller account.
- Remaining release work is limited to the admin approvals frontend bugfix deploy, production test-data cleanup, and ops evidence.
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
- Verified the public production smoke check passes after redeploy, including legal pages and footer links
- Verified the authenticated production publish-flow smoke passes with the approved seller test account
- Fixed the admin approvals client so production approve/reject requests no longer send an empty JSON content type

### 2026-03-10
- Removed conditional test skips and stabilized suites
- Updated docs to final no-skip validated state
- Production builds verified for both frontend and backend

## Operational Pointers
- Setup/run: `README.md`, `SERVER_MANAGEMENT.md`
- Architecture/details: `COMPLETE_PROJECT_DOCUMENTATION.md`
- Prompt artifacts retained: `PHASE*_MASTER_PROMPT.md`, transition files, and strategy docs
