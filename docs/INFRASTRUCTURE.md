# Infrastructure

## Document Control
- Owner: Ops Lead (TBD)
- Last Updated: 2026-03-19
- Environment: local + staging/prod TBD
- Status: in-progress

## Hosting & Environments
- Cloud provider: TBD (production)
- Account/project: TBD
- Production URL: TBD
- Staging URL: TBD
- Region(s): TBD
- Runtime model (containers/VM/serverless): Docker Compose (local), production TBD

## DNS & TLS
- DNS provider: TBD
- Domain(s): TBD
- SSL/TLS certificate issuer: TBD
- Auto-renewal configured: TBD
- HTTPS redirect enabled: TBD
- HSTS enabled: TBD

## Network & Edge
- CDN provider: TBD
- WAF/edge protection: TBD
- Load balancer: TBD
- Allowed ingress rules: local ports 3000/3001/5432/6379
- Private networking details: Docker bridge network (local)

## Scaling & Availability
- Auto-scaling policy: TBD
- Min/max instances: TBD
- Health probe path(s): `/health`, `/health/ready`, `/health/live`, `/version`
- Expected RTO: TBD
- Expected RPO: TBD

## Data & Backups
- Database backup location: local drill dump in Postgres container `/tmp/casamx_day4_20260319.dump`; production object storage TBD
- Backup frequency: Daily recommended (production policy pending)
- Backup retention: TBD
- Restore test last run: 2026-03-19 (local drill to `casamx_restore_drill`)
- Cross-region copy enabled: TBD

## Monitoring & Logging
- Monitoring platform: TBD
- Log aggregation platform: TBD
- Alert channels (Slack/email/pager): TBD
- Critical dashboards: TBD

## Deployment & Rollback
- CI/CD pipeline: GitHub Actions (frontend/backend test/build workflows)
- Release strategy (blue/green/rolling): TBD
- One-command deploy path: TBD
- Rollback command/procedure: lockfile-based rebuild rehearsal (`npm ci` + build) validated locally
- Last rollback test date: 2026-03-19 (local rehearsal)

## Disaster Recovery
- DR playbook location: `docs/RUNBOOK.md`
- Incident commander role: TBD
- Escalation contacts: TBD

## Go-Live Checks
- [ ] Production env reachable
- [ ] Staging mirrors production
- [ ] TLS and DNS validated
- [ ] Monitoring and alerts active
- [ ] Backup + restore verified
- [ ] Rollback tested
