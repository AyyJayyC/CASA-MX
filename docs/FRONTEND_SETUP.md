# Frontend Setup

## Document Control
- Owner:
- Last Updated:
- Status: draft / in-progress / approved

## Runtime & Deployment
- Hosting provider:
- Production URL:
- Build command:
- Start command:
- Deployment trigger:

## Required Environment Variables
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_ANALYTICS_ENABLED`
- `NEXT_PUBLIC_ANALYTICS_PROVIDER`

## Routing & Core Pages
- Home:
- Login:
- Register:
- Properties list:
- Property detail:
- Upload sale/rental:
- Admin approvals:

## Performance
- Image optimization enabled: yes/no
- Caching strategy:
- Lighthouse baseline links:

## Frontend Security
- Content security policy strategy:
- XSS handling notes:
- Sensitive values exposed in client bundles: yes/no

## Build & Validation
```bash
npm run build
npm run start
npm test -- --run
npm run test:e2e
```

## Go-Live Checks
- [ ] Production build is reproducible
- [ ] All critical pages render
- [ ] API points to production backend
- [ ] No blocking browser console errors
- [ ] E2E smoke flows pass
- [ ] Mobile layout sanity checks pass
