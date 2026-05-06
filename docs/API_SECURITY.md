# API Security

## Document Control
- Owner:
- Last Updated:
- Status: draft / in-progress / approved

## Endpoint Inventory (Critical)
- Auth: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/me`, `/auth/logout`
- Properties: `/properties`, `/properties/:id`
- Maps: `/maps/autocomplete`, `/maps/geocode`
- Applications: `/applications`, `/applications/property/:propertyId`
- Admin: `/admin/*`

## Input Validation
- Validation library:
- Unknown field handling policy:
- File upload validation policy:
- Max payload/file sizes:

## Error Handling
- Generic client-safe error envelope:
- Stack traces hidden in production: yes/no
- Sensitive data redaction in errors/logs: yes/no

## Rate Limiting
- Global limits:
- Auth route limits:
- Search/maps limits:
- 429 response contract:

## Third-Party API Security
- Google Maps key restrictions:
- Allowed APIs:
- Quota limits:
- Billing alerts:

## Test Matrix
- [ ] SQL injection payload rejected
- [ ] XSS payload rejected/sanitized
- [ ] Missing required fields return 400
- [ ] Invalid UUID/params return 400
- [ ] Rate limits return 429 when exceeded
- [ ] 500 errors do not leak internal stack/details

## Findings & Actions
| Finding | Severity | Endpoint | Fix | Owner | ETA |
|---|---|---|---|---|---|
|  |  |  |  |  |  |
