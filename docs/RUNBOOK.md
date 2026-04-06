# Operations Runbook

## Document Control
- Owner: Ops Lead (TBD)
- Last Updated: 2026-03-19
- Status: in-progress

## Service Inventory
- Frontend URL: http://localhost:3000 (local)
- Backend URL: http://localhost:3001 (local)
- Database host: localhost:5432 (`casamx-postgres`)
- Redis host: localhost:6379 (`casamx-redis`)
- Monitoring dashboard: TBD (production)
- Monitoring ownership checklist: `docs/MONITORING_OWNERSHIP_CHECKLIST_2026-03-19.md`

## On-Call & Escalation
- L1 Support: TBD
- L2 Engineering: TBD
- L3 Ops: TBD
- Executive escalation: TBD
- Incident channel: TBD

## Incident Severity Matrix
- Sev1: full outage / auth down / data risk
- Sev2: major feature degraded
- Sev3: minor degradation

## Common Procedures

### 1) App Won’t Start
1. Check env vars.
2. Check DB/Redis reachability.
3. Check app logs.
4. Restart services.
5. Validate `/health`.

Quick commands:
- `docker compose ps`
- `docker exec casamx-redis redis-cli ping`
- `curl http://localhost:3001/health`

### 2) Elevated 5xx Errors
1. Check recent deploys.
2. Check DB connections and slow queries.
3. Check third-party service status (Maps/email/payments).
4. Rollback if error rate remains high.

Quick commands:
- `curl http://localhost:3001/health/ready`
- `curl http://localhost:3001/version`

### 3) Database Degradation
1. Inspect slow query logs.
2. Inspect connection pool saturation.
3. Apply safe mitigations (limit traffic, rollback hot path).
4. Escalate to DB owner.

### 4) Disk Pressure
1. Inspect disk usage by logs/artifacts.
2. Rotate/trim logs safely.
3. Validate backups before cleanup.

### 5) Release + Rollback
1. Confirm CI green.
2. Deploy to staging and smoke test.
3. Deploy production.
4. Monitor 30–60 min.
5. If Sev1/Sev2, execute rollback.

Rollback rehearsal (2026-03-19):
- Backend: `npm ci` + `npm run build` (pass)
- Frontend: `npm ci` + `npm run build` (pass)
- Evidence: `docs/OPS_DAY4_EVIDENCE_2026-03-19.md`

## Monitoring & Alerts
- API availability alert: TBD (production)
- Error rate alert: TBD (production)
- Latency p95 alert: TBD (production)
- CPU/memory alert: TBD (production)
- Backup failure alert: TBD (production)

Monitoring closure checklist (required before re-audit):
- [ ] Fill dashboard URLs and primary/backup owners in `docs/MONITORING_OWNERSHIP_CHECKLIST_2026-03-19.md`
- [ ] Fill alert channels and on-call ownership for all critical alerts
- [ ] Capture screenshots of alert rules and channel routing
- [ ] Run one synthetic test alert and record acknowledgement evidence

## Backup & Restore
- Backup schedule: Daily logical dump (recommended)
- Backup location: Postgres container `/tmp` in local drill; external object storage TBD (production)
- Restore procedure: `pg_dump` -> create restore DB -> `pg_restore` -> row-count integrity check
- Last restore drill: 2026-03-19 (local)

## Post-Incident Template
- Timeline:
- User impact:
- Root cause:
- Corrective actions:
- Preventive actions:
