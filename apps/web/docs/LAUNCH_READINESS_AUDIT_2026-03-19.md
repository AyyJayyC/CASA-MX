# Casa MX Launch Readiness Report
Date: March 19, 2026
Prepared by: Senior Launch Manager (Audit)

## RECOMMENDATION: NO-GO (Delay Launch)

## Executive Summary
- Audit scope covered architecture, security controls, data/migrations, API smoke behavior, frontend build posture, and operations readiness using workspace evidence and live local checks.
- Core product flows are largely functional (health/properties/maps/auth smoke checks pass), and migration state is current.
- Launch is blocked by security, legal/compliance, and operations gaps that are not acceptable for a production go-live tomorrow.

## Evidence Snapshot
- API smoke checks: `/health`, `/properties`, `/properties/filter-options`, `/maps/autocomplete?input=roma`, and `/auth/login` returned 200 locally.
- Migration state: `npx prisma migrate status` reports database schema up to date (8 migrations).
- Backend build: `npm run build` passes in backend.
- Frontend build: local run failed due `.next/trace` file lock; CI workflow exists and historically passed, but this local run was not cleanly reproducible.
- DB metrics (live local): users=526, properties=32, applications=0, requests=1, db size≈11 MB.

## Issue Summary
- Critical: 4
- High: 5
- Medium: 7
- Low: 5

## Critical Blockers (Must Fix Before Launch)
1. **Unresolved high-severity dependency vulnerabilities**
   - `npm audit --omit=dev` shows high vulnerabilities in both repos (notably `next` and `fastify` dependency trees).
   - Impact: known published vulnerabilities in internet-facing stack.
   - Fix: upgrade/pin patched ranges (or safe major upgrades with regression tests), regenerate lockfiles, rerun full suite.

2. **Legal/compliance artifacts missing from product surface**
   - No privacy policy, terms of service, or cookie policy pages/links found in app routes/components.
   - Impact: legal exposure and blocked compliance sign-off for launch.
   - Fix: publish policy pages, add footer links, capture consent where required.

3. **Production operations readiness not evidenced**
   - No verifiable production hosting/runbook artifacts for monitoring/alerting, backup verification, restore drill, status page, on-call schedule, or DR RTO/RPO.
   - Impact: unacceptable operational risk at go-live.
   - Fix: complete and test operational controls; document ownership/escalation.

4. **Session/refresh token revocation state is in-memory only**
   - Refresh rotation/revocation maps are process-local (`Map`/`Set` in auth route), not durable/shared.
   - Impact: inconsistent auth behavior across restarts/scale-out; weak incident response for token revocation.
   - Fix: store refresh session state in Redis/DB with TTL and enforce globally.

## High Priority Gaps
1. Missing `/version` endpoint (checklist requirement, runtime currently 404).
2. `/health` is shallow (`{status:'ok'}`) and does not verify DB/Redis readiness.
3. Graceful shutdown not implemented in server bootstrap (`SIGTERM`/`SIGINT` hooks absent).
4. No documented rollback test evidence for release pipeline.
5. No demonstrated load/stress test evidence for launch traffic envelope.

## Medium Priority Gaps
1. Frontend production build reproducibility not confirmed in current local session (file-lock failure).
2. No confirmed TLS/HSTS/security-header external validation evidence for production domain.
3. No explicit account deletion/export flows verified for privacy rights.
4. No documented security scanning gate in CI beyond tests/build.
5. No explicit CDN/DNS/infrastructure sign-off record.
6. No documented support/on-call escalation matrix in current frontend docs set.
7. No status page/incident comms runbook evidence.

## What Is Ready
- Strong baseline app architecture and test history (documented large passing suites).
- CI workflows present for frontend/backend tests/build and Playwright.
- Core backend security controls present: CORS allowlist behavior, Helmet, rate limits, Zod validation, JWT auth, role guards.
- Google-only maps path + env fail-fast guard implemented.

## Phase-by-Phase Verdict
- Phase 1 Architecture & Infrastructure: **FAIL** (production infra evidence incomplete)
- Phase 2 Security: **FAIL** (dependency vulns + token-state architecture)
- Phase 3 Data & DB: **PASS with risks** (migrations/data healthy; backup/restore proof missing)
- Phase 4 API & Integrations: **PASS (smoke)**
- Phase 5 Frontend & UX: **PASS with risks** (build reproducibility issue in this local run)
- Phase 6 Performance & Scaling: **FAIL** (no current load/stress evidence)
- Phase 7 Compliance & Legal: **FAIL**
- Phase 8 Operations & Support: **FAIL**

## Decision Matrix Outcome
- Go criteria not met due unresolved critical issues.
- Launch tomorrow is **not approved**.

## Required Remediation Plan (48–72 hours)
1. **Security patch sprint**
   - Upgrade vulnerable production deps; rerun backend+frontend+E2E suites; capture signed security recheck.
2. **Auth hardening**
   - Move refresh-token active/revoked state to Redis/DB; add tests for restart and multi-instance behavior.
3. **Ops readiness pack**
   - Add and validate monitoring alerts, backup+restore drill evidence, rollback procedure, on-call rota, incident comms.
4. **Legal/compliance minimum**
   - Publish privacy/terms/cookie docs and enforce registration consent where required.
5. **Readiness endpoints**
   - Add `/version`; enhance `/health` to include DB/Redis readiness and degraded-state semantics.

## Conditional Re-Audit Gate (Fast Recheck)
- Full dependency audit: no high/critical unresolved in production dependency graph.
- Full CI green (frontend/backend/unit/integration/E2E/build).
- Verified runbooks and ownership documented.
- Legal pages live and linked.
- Updated sign-off from Security, Engineering, Ops, Product.

## Final Sign-Off
- Current decision: **NO-GO**
- Confidence level: **High** (based on direct evidence collected in repo/runtime)
