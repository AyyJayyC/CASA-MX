# Post-release Actions (Phase 4)

Date: 2026-03-14
Release commit: e0f2bcf1

## P0 — This week

- [ ] Remove deprecated Compose `version` key from backend compose file
  - Owner: DevOps
  - Due: 2026-03-18
  - Success criteria: `docker compose` runs without the `version is obsolete` warning.

- [ ] Add backend repo verification pass (if maintained separately)
  - Owner: Backend
  - Due: 2026-03-18
  - Success criteria: backend branch/remote status documented and synchronized.

- [ ] Add CI gate for E2E clean-run precheck on port 3000
  - Owner: QA
  - Due: 2026-03-19
  - Success criteria: CI prevents parallel local server collision and reports clear error guidance.

## P1 — Next sprint

- [ ] Split “docs cleanup” and “feature changes” into separate PR lanes
  - Owner: Engineering
  - Due: 2026-03-25
  - Success criteria: future release PRs show smaller, clearly-scoped diffs.

- [ ] Add release checklist automation script
  - Owner: Engineering
  - Due: 2026-03-26
  - Success criteria: one command runs health checks + unit + E2E and emits a summary report.

## Verification commands

- Backend health: `Invoke-RestMethod http://localhost:3001/health`
- Frontend smoke: `Invoke-WebRequest http://localhost:3000`
- Frontend tests: `npm test -- --run`
- E2E tests: `npm run test:e2e:auto`

## Final sign-off

- [ ] Product sign-off complete
- [ ] QA sign-off complete
- [ ] Release notes published
- [ ] Rollback note verified