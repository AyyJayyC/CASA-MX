# Monitoring Ownership Checklist

Date: 2026-03-19
Status: In progress
Scope: Day 4 monitoring + alerts ownership definition for launch re-audit

## Platforms
- Metrics/alerts platform: Proposed `Grafana + Prometheus` (final platform owner confirmation pending)
- Log aggregation platform: Proposed `Loki` (or equivalent managed logs)
- Pager/escalation platform: Proposed `PagerDuty` (fallback: Slack + phone tree)

## Required Dashboards
| Dashboard | Minimum Panels | Owner | Backup Owner | Status | Evidence |
|---|---|---|---|---|---|
| API Health | uptime, status code split, readiness probe status | L2 Backend On-Call | L3 Ops/SRE | Ownership Prefilled | URL pending |
| API Performance | p50/p95/p99 latency, request volume | L2 Backend On-Call | L3 Ops/SRE | Ownership Prefilled | URL pending |
| Error Budget | 4xx/5xx rates, top error routes | L2 Backend On-Call | Incident Commander Backup | Ownership Prefilled | URL pending |
| Infrastructure | CPU, memory, disk, container restarts | L3 Ops/SRE | L2 Backend On-Call | Ownership Prefilled | URL pending |
| Data Services | Postgres connections/replication, Redis memory/evictions | L3 Ops/SRE | L2 Backend On-Call | Ownership Prefilled | URL pending |

## Required Alerts
| Alert | Threshold | Channel | Primary On-Call | Secondary | Runbook Link | Status |
|---|---|---|---|---|---|---|
| API availability | < 99% over 5 min | #casamx-incidents + pager-critical | L2 Backend On-Call | L3 Ops/SRE | docs/RUNBOOK.md | Ownership Prefilled |
| Error rate | 5xx > 2% over 10 min | #casamx-incidents + pager-high | L2 Backend On-Call | Incident Commander Backup | docs/RUNBOOK.md | Ownership Prefilled |
| Latency | p95 > 1000ms over 10 min | #casamx-observability + pager-high | L2 Backend On-Call | L3 Ops/SRE | docs/RUNBOOK.md | Ownership Prefilled |
| DB connectivity | readiness check fails 3 times | #casamx-incidents + pager-critical | L3 Ops/SRE | L2 Backend On-Call | docs/RUNBOOK.md | Ownership Prefilled |
| Redis connectivity | readiness check fails 3 times | #casamx-incidents + pager-critical | L3 Ops/SRE | L2 Backend On-Call | docs/RUNBOOK.md | Ownership Prefilled |
| Backup failure | daily backup job failed | #casamx-data-ops + pager-high | L3 Ops/SRE | Incident Commander Backup | docs/RUNBOOK.md | Ownership Prefilled |

## Target ETA (for re-audit package)
- Owner role confirmation: 2026-03-20 EOD
- Dashboard URL attachment: 2026-03-21 12:00 local
- Alert screenshot evidence: 2026-03-21 12:00 local
- Synthetic test alert acknowledgement evidence: 2026-03-21 15:00 local

## Evidence Required For Re-Audit
- Dashboard URLs for all required dashboards.
- Alert policy screenshots showing thresholds and notification channels.
- Proof of one test alert acknowledged by on-call.
- Named primary/backup owners filled for every dashboard and alert.

## Next Action
- Fill owners and channels, then attach links/screenshots and update `docs/PRELAUNCH_REMEDIATION_TRACKER.md` Day 4 status.
