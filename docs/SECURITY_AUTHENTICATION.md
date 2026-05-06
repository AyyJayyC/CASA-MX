# Security - Authentication & Authorization

## Document Control
- Owner:
- Last Updated:
- Status: draft / in-progress / approved

## JWT Configuration
- Access token expiry:
- Refresh token expiry:
- JWT secret source:
- Secret rotation policy:
- Token signing algorithm:

## Session & Refresh Strategy
- Refresh token storage model (DB/Redis/memory):
- Revocation strategy:
- Multi-instance consistency:
- Logout invalidation behavior:

## Cookie / Header Policy
- Access token transport: cookie/header
- `HttpOnly`:
- `Secure`:
- `SameSite`:
- CSRF mitigation approach:

## Authorization Model
- Roles:
- Role approval workflow:
- Route guards:
- Owner-only enforcement rules:

## Abuse Protections
- Login rate limits:
- Register rate limits:
- Global request limits:
- Brute-force lockout policy:

## Security Test Cases
- [ ] Valid login returns token/session
- [ ] Invalid login rejected without user enumeration
- [ ] Expired access token returns 401
- [ ] Expired/invalid refresh token rejected
- [ ] User cannot access another user’s protected data
- [ ] Non-admin blocked from admin endpoints
- [ ] Owner-only routes enforce ownership

## Open Risks
| Risk | Impact | Probability | Mitigation | Owner | ETA |
|---|---|---|---|---|---|
|  |  |  |  |  |  |
