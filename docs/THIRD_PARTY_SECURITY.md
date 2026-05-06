# Third-Party Security

## Document Control
- Owner:
- Last Updated:
- Status: draft / in-progress / approved

## Service Inventory
| Service | Purpose | Credential Location | Scope Restrictions | Quota/Rate Limits | Alerts Configured |
|---|---|---|---|---|---|
| Google Maps | Geocode + autocomplete |  |  |  |  |
|  |  |  |  |  |  |

## Google Maps Specific Checks
- API key restricted by API list: yes/no
- API key restricted by source (IP/referrer): yes/no
- Quota ceilings configured: yes/no
- Billing alerts configured: yes/no
- Fallback behavior documented: yes/no

## Secrets Management
- Secret rotation cadence:
- Last rotation date:
- Secret leakage detection process:

## Incident Handling
- Vendor outage fallback:
- Degraded-mode behavior:
- Alert escalation path:

## Checklist
- [ ] Keys are not hardcoded in client code
- [ ] Least-privilege API scopes are enforced
- [ ] Quota alerts tested
- [ ] Runbook includes vendor outage plan
