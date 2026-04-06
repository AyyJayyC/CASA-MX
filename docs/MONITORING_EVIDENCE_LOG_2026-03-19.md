# Monitoring Evidence Log

Date: 2026-03-19
Purpose: Single fill-ready artifact for Day 4 monitoring/alerts closure and re-audit submission.
Status: Pending evidence attachment

## Quick Completion Checklist
- [ ] Replace all `TBD` values in this document.
- [ ] Fill all owner names and backup owner names.
- [ ] Attach dashboard and alert screenshot paths under `docs/evidence/monitoring/`.
- [ ] Record one synthetic alert drill with trigger and acknowledgement timestamps.
- [ ] Mark all rows as `Complete` and obtain reviewer sign-off.

## Completion Rule
Day 4 monitoring/on-call closure is considered complete when every row below has owner, link/path, timestamp, and reviewer sign-off.

## Dashboard Evidence
| Dashboard | URL | Owner (Name) | Backup Owner (Name) | Screenshot Path | Captured At (Local Time) | Reviewer | Status |
|---|---|---|---|---|---|---|---|
| API Health | TBD | L2 Backend On-Call (TBD name) | L3 Ops/SRE (TBD name) | TBD | TBD | TBD | Ownership Prefilled |
| API Performance | TBD | L2 Backend On-Call (TBD name) | L3 Ops/SRE (TBD name) | TBD | TBD | TBD | Ownership Prefilled |
| Error Budget | TBD | L2 Backend On-Call (TBD name) | Incident Commander Backup (TBD name) | TBD | TBD | TBD | Ownership Prefilled |
| Infrastructure | TBD | L3 Ops/SRE (TBD name) | L2 Backend On-Call (TBD name) | TBD | TBD | TBD | Ownership Prefilled |
| Data Services (Postgres/Redis) | TBD | L3 Ops/SRE (TBD name) | L2 Backend On-Call (TBD name) | TBD | TBD | TBD | Ownership Prefilled |

## Alert Policy Evidence
| Alert | Rule Link | Threshold Confirmed | Channel | Primary On-Call (Name) | Secondary (Name) | Screenshot Path | Last Test Trigger Time | Ack Time | Reviewer | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| API availability | TBD | Yes / No | #casamx-incidents + pager-critical | L2 Backend On-Call (TBD name) | L3 Ops/SRE (TBD name) | TBD | TBD | TBD | TBD | Ownership Prefilled |
| Error rate (5xx) | TBD | Yes / No | #casamx-incidents + pager-high | L2 Backend On-Call (TBD name) | Incident Commander Backup (TBD name) | TBD | TBD | TBD | TBD | Ownership Prefilled |
| Latency (p95) | TBD | Yes / No | #casamx-observability + pager-high | L2 Backend On-Call (TBD name) | L3 Ops/SRE (TBD name) | TBD | TBD | TBD | TBD | Ownership Prefilled |
| DB connectivity | TBD | Yes / No | #casamx-incidents + pager-critical | L3 Ops/SRE (TBD name) | L2 Backend On-Call (TBD name) | TBD | TBD | TBD | TBD | Ownership Prefilled |
| Redis connectivity | TBD | Yes / No | #casamx-incidents + pager-critical | L3 Ops/SRE (TBD name) | L2 Backend On-Call (TBD name) | TBD | TBD | TBD | TBD | Ownership Prefilled |
| Backup failure | TBD | Yes / No | #casamx-data-ops + pager-high | L3 Ops/SRE (TBD name) | Incident Commander Backup (TBD name) | TBD | TBD | TBD | TBD | Ownership Prefilled |

## Synthetic Alert Drill Evidence
| Drill ID | Triggered By | Alert Tested | Trigger Time | Acked By | Ack Time | Resolution Time | Proof Link/Screenshot | Notes | Status |
|---|---|---|---|---|---|---|---|---|---|
| DRILL-2026-03-21-01 (planned) | Ops Lead (TBD name) | API availability | TBD | Primary On-Call (TBD name) | TBD | TBD | TBD | Planned synthetic test for re-audit evidence | Planned |

## Evidence Path Convention
- Dashboard screenshots: `docs/evidence/monitoring/dashboards/<dashboard-name>-YYYYMMDD-HHMM.png`
- Alert screenshots: `docs/evidence/monitoring/alerts/<alert-name>-YYYYMMDD-HHMM.png`
- Synthetic drill proof: `docs/evidence/monitoring/drills/<drill-id>.png`

## Final Sign-Off
| Area | Owner | Date | Sign-Off |
|---|---|---|---|
| Dashboards complete |  |  | Pending |
| Alerts configured |  |  | Pending |
| On-call routing verified |  |  | Pending |
| Synthetic drill passed |  |  | Pending |
