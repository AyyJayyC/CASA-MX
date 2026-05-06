# On-Call Rotation Draft

Date: 2026-03-19
Status: Draft (assignment pending)

## Coverage Model
- Primary coverage window: 24x7 (target) or business-hours + pager escalation (to be finalized)
- Severity-based response:
  - Sev1: acknowledge within 5 minutes
  - Sev2: acknowledge within 15 minutes
  - Sev3: acknowledge within 4 business hours

## Rotation Structure
- L1 Support: TBD
- L2 Engineering (Backend): TBD
- L2 Engineering (Frontend): TBD
- L3 Ops/SRE: TBD
- Incident Commander backup: TBD

## Escalation Path
1. Alert triggers to on-call channel.
2. L1 triage within SLA.
3. Escalate to L2 if unresolved in 15 minutes.
4. Escalate to L3 + Incident Commander for Sev1/Sev2 prolonged incidents.

## Communication Channels
- Incident channel: Proposed `#casamx-incidents`
- Observability channel: Proposed `#casamx-observability`
- Data operations channel: Proposed `#casamx-data-ops`
- Pager system: Proposed `pager-critical` / `pager-high` schedules
- Status page owner: Incident Commander backup role (pending named assignee)

## Action Required
- Assign named owners and contacts before launch re-audit.
