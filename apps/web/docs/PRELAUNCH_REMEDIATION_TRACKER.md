# Pre-Launch Remediation Tracker

## Goal
Close all blockers from launch audit and reach conditional/green go-live status.

## Current Decision
- Launch status: **NO-GO**
- Target re-audit date: 2026-03-21 (conditional, pending remaining Day 4/Day 5 evidence)
- Program owner: __________________
- Engineering lead: __________________
- Security lead: __________________
- Ops lead: __________________

## Suggested Timeline (Fast Path)
- **Day 1 (Security + API hardening):** dependency remediation, `/version`, `/health` readiness, graceful shutdown.
- **Day 2 (Auth durability):** durable refresh/session revocation store + tests.
- **Day 3 (Legal + UX):** privacy/terms/cookie pages, footer links, consent flow checks.
- **Day 4 (Ops readiness):** monitoring, on-call, backup/restore drill, rollback drill.
- **Day 5 (Validation + sign-off):** full CI green, re-audit package, executive review.

## Priority Board

### P0 (Blockers)
| Task | Owner | ETA | Evidence Required | Status |
|---|---|---|---|---|
| Resolve high-severity dependency vulnerabilities (frontend+backend) | Eng Lead | Day 1 | `npm audit --omit=dev --audit-level=high` results + lockfile diff + passing tests | Completed |
| Publish Privacy/Terms/Cookie pages + footer links | Product + FE Lead | Day 3 | Live URLs + footer screenshot + route tests | Completed (frontend + consent checkbox path) |
| Add durable refresh-token revocation/session store (Redis/DB) | BE Lead | Day 2 | Integration tests (restart + multi-instance semantics) + design note | Completed (backend) |
| Confirm monitoring, backup+restore drill, on-call | Ops Lead | 2026-03-21 15:00 | Dashboard links + alert screenshots + restore log + on-call rota | In progress (restore done; evidence table prefilled with role ownership/channels; named assignees + URLs/screenshots pending) |

### P1 (High)
| Task | Owner | ETA | Evidence Required | Status |
|---|---|---|---|---|
| Add `/version` endpoint | BE Lead | Day 1 | `curl /version` output + API test | Completed (backend) |
| Upgrade `/health` to include DB/Redis readiness | BE Lead | Day 1 | healthy/degraded payload samples + test coverage | Completed (backend) |
| Add graceful shutdown hooks (`SIGTERM`/`SIGINT`) | BE Lead | Day 1 | controlled shutdown logs + integration check | Completed (backend) |
| Produce rollback test record (staging/prod-like) | Ops Lead | 2026-03-21 12:00 | rollback checklist + timestamped drill notes | In progress (local rehearsal complete; staging/prod-like run pending) |
| Run load/stress baseline (k6/JMeter) | BE + Ops | 2026-03-21 17:00 | report (p95/p99/error rate/capacity ceiling) | Not started |

### P2 (Medium)
| Task | Owner | ETA | Evidence Required | Status |
|---|---|---|---|---|
| Confirm reproducible frontend production build | FE Lead | Day 2 | clean build logs in CI + local clean workspace run | Completed (local verified) |
| Validate TLS headers/grade on production domain | Ops + Security | Day 4 | SSL Labs + securityheaders.com reports | Not started |
| Define data export/deletion workflows | Product + BE | Day 3 | workflow doc + API/ops runbook updates | Not started |

## Execution Checklist (By Workstream)

### Security Workstream
- [x] Run backend audits and pin patched backend dependency versions.
- [x] Re-run backend tests/build and capture evidence artifact.
- [x] Capture backend vulnerability before/after snapshot.
- [x] Run frontend audits and pin patched frontend dependency versions.
- [x] Re-run frontend tests/build after remediation.
- [x] Capture frontend vulnerability before/after snapshot.

### Backend Hardening Workstream
- [x] Implement `/version` endpoint.
- [x] Extend `/health` with DB/Redis readiness and degraded-state behavior.
- [x] Add graceful shutdown handling and verify close hooks.

### Auth Durability Workstream
- [x] Move refresh-token active/revoked state from in-memory to Redis/DB.
- [x] Add regression tests for token revocation after restart/rotation semantics.
- [x] Validate behavior for multi-instance consistency assumptions via shared token store.

### Legal + Frontend Workstream
- [x] Add `privacy`, `terms`, and `cookie` pages.
- [x] Link policies in app footer.
- [x] Validate policy links and consent capture path.

### Ops Workstream
- [ ] Configure monitoring dashboards + alert rules (owners/channels prefilled; URLs/screenshots pending).
- [ ] Fill monitoring evidence table (names, URLs, screenshots, timestamps) and collect reviewer sign-off.
- [x] Create monitoring ownership checklist artifact.
- [x] Execute backup + restore drill and record timestamps.
- [x] Validate rollback procedure with release artifact (local lockfile rehearsal).
- [x] Publish on-call rotation + escalation contacts (draft).

## Verification Checklist (Re-Audit Gate)
- [ ] `INFRASTRUCTURE.md` approved
- [ ] `BACKEND_SETUP.md` approved
- [ ] `FRONTEND_SETUP.md` approved
- [ ] `SECURITY_AUTHENTICATION.md` approved
- [ ] `API_SECURITY.md` approved
- [ ] `COMPLIANCE.md` approved
- [ ] `RUNBOOK.md` approved
- [ ] Full CI green (backend/frontend/e2e/build)

## Acceptance Artifacts (Attach Links)
- Security audit snapshot (before/after): `casa-mx-backend/SECURITY_AUDIT_BASELINE.md`; `casa-mx/docs/FRONTEND_SECURITY_AUDIT_BASELINE_2026-03-19.md`
- Auth durability evidence: `casa-mx-backend/AUTH_DURABILITY_DAY2_2026-03-19.md`; `casa-mx-backend/tests/checkpoint2.test.ts`
- Legal pages evidence: `casa-mx/docs/LEGAL_DAY3_EVIDENCE_2026-03-19.md`; routes `/privacy`, `/terms`, `/cookie`
- Consent path evidence: `casa-mx/app/register/page.jsx`; `casa-mx/tests/components/RegisterPage.test.jsx`; `casa-mx/docs/LEGAL_DAY3_EVIDENCE_2026-03-19.md`
- Monitoring ownership checklist: `casa-mx/docs/MONITORING_OWNERSHIP_CHECKLIST_2026-03-19.md`
- Monitoring evidence log (fill-ready): `casa-mx/docs/MONITORING_EVIDENCE_LOG_2026-03-19.md`
- On-call channel/role prefill: `casa-mx/docs/ONCALL_ROTA_DRAFT_2026-03-19.md`
- Re-audit handoff draft: `casa-mx/docs/RE_AUDIT_HANDOFF_DRAFT_2026-03-19.md`
- CI run URL (full green): __________________
- Load/stress report: __________________
- Backup/restore drill evidence: `casa-mx/docs/OPS_DAY4_EVIDENCE_2026-03-19.md`
- Rollback drill evidence: `casa-mx/docs/OPS_DAY4_EVIDENCE_2026-03-19.md`
- Legal page URLs (prod): __________________

## Daily Update Log
| Date | Owner | Update | Risks | Next Step |
|---|---|---|---|---|
| 2026-03-19 | Launch Manager | Tracker prefilled with execution plan and priorities | Owners not yet assigned | Assign owners and lock ETAs |
| 2026-03-19 | BE Lead | Day 1 backend hardening and dependency remediation executed; backend audit now 0 vulnerabilities and backend tests/build passing | Frontend dependency gate still pending | Execute frontend audit/remediation and attach CI artifacts |
| 2026-03-19 | FE Lead | Frontend dependency and build/test gates remediated: Next upgraded to 15.5.14, audit high=0, build pass, tests pass | P0 legal and auth-durability blockers remain | Start Day 2 auth durability and Day 3 legal page delivery |
| 2026-03-19 | BE Lead | Day 2 auth durability implemented: refresh token active/revoked state moved to shared Redis-backed store with tests for persisted active JTI and rotation/revocation behavior; backend suite green (218/218) | Legal/compliance blockers remain | Start Day 3 legal pages and footer links |
| 2026-03-19 | FE Lead | Day 3 legal minimum delivered: privacy/terms/cookie pages published and linked in global footer; frontend build/tests and audit high gate all pass | Consent capture verification still open | Validate consent path and complete compliance sign-off |
| 2026-03-19 | Ops/Eng | Day 4 ops evidence captured: postgres/redis health verified, backup+restore drill executed, rollback lockfile rehearsal completed, on-call draft published | Monitoring dashboards/alerts and named ownership still pending | Finalize monitoring stack ownership and attach alert screenshots |
| 2026-03-19 | FE/Ops | Registration consent checkbox path added and validated in frontend tests; monitoring ownership checklist document created and linked in runbook/tracker | Monitoring owners/channels/screenshots still pending | Fill monitoring ownership fields and attach dashboard/alert evidence |
| 2026-03-19 | Ops/Eng | Monitoring and on-call docs prefilled with proposed role ownership and alert channels; Day 4 ETAs converted to timestamped targets for re-audit package | Named individuals and screenshot evidence not yet attached | Assign named owners and upload dashboard/alert evidence by 2026-03-21 |
| 2026-03-19 | Ops/Eng | Fill-ready monitoring evidence log created and linked to Day 4 blocker for one-document closure workflow | Evidence rows still empty until dashboards/alerts are attached | Populate evidence log rows and collect reviewer sign-off |
| 2026-03-19 | Ops/Eng | Monitoring evidence log now pre-populated with role/channel defaults and planned synthetic drill row | Named individuals and artifact links still missing | Replace TBD values with real owners and attach screenshot proof paths |
| 2026-03-19 | Launch Manager | Re-audit handoff draft created and linked for final approver package assembly | Submission still blocked by pending monitoring artifacts | Complete evidence log and update handoff draft to ready-for-review |
| 2026-03-19 | Launch Manager | Final pass added executive ready/not-ready gate snapshot with blocker count and gate-level status matrix in re-audit handoff | Monitoring evidence and final artifact links still missing | Replace remaining TBDs and submit conditional re-audit package |
