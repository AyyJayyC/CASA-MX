# Ops Day 4 Evidence

Date: 2026-03-19
Scope: Day 4 operations readiness execution (local evidence)

## Services Health Check
Command:
- docker compose ps

Result:
- casamx-postgres: Up (healthy)
- casamx-redis: Up (healthy)

Redis check:
- docker exec casamx-redis redis-cli ping
- Result: PONG

## Backup + Restore Drill (PostgreSQL)
Commands executed:
1. docker exec casamx-postgres pg_dump -U postgres -d casamx -F c -f /tmp/casamx_day4_20260319.dump
2. docker exec casamx-postgres psql -U postgres -c "DROP DATABASE IF EXISTS casamx_restore_drill;"
3. docker exec casamx-postgres psql -U postgres -c "CREATE DATABASE casamx_restore_drill;"
4. docker exec casamx-postgres pg_restore -U postgres -d casamx_restore_drill /tmp/casamx_day4_20260319.dump
5. docker exec casamx-postgres psql -U postgres -d casamx_restore_drill -c 'SELECT count(*) AS user_count FROM "User";'
6. docker exec casamx-postgres psql -U postgres -d casamx_restore_drill -c '\dt'

Validation results:
- Restore database created successfully.
- User table row check passed (`user_count = 1`).
- Restored schema tables listed (`17` tables including `_prisma_migrations`).

## Rollback Rehearsal (Lockfile-based)
Backend:
- npm ci
- npm run build
- Result: PASS

Frontend:
- npm ci
- npm run build
- Result: PASS (Next.js 15.5.14 build complete)

## Security Gate Recheck
Backend:
- npm audit --omit=dev --audit-level=high
- Result: 0 vulnerabilities

## Open Ops Items (Still Pending)
- Monitoring dashboards and alert rules (platform/ownership assignment and screenshots pending; checklist created in `docs/MONITORING_OWNERSHIP_CHECKLIST_2026-03-19.md`).
- On-call rotation and escalation matrix final assignment.
- Production backup retention and cross-region replication policy.
- Production rollback test on deployment platform (not just local lockfile rehearsal).
