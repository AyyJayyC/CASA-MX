# Project Instructions

## Automatic staging push

When making code changes, ALWAYS commit and push to the `staging` branch automatically — no need to ask. Vercel and Railway will auto-deploy staging for verification.

## Production deployment rule

NEVER push or merge to `main` (production) without the user explicitly directing you to do so. The user must use a phrase like "merge to production", "push to live", "deploy to production", or "/deploy" before any production deployment occurs.

When changes on `staging` are ready for production, remind the user once (max), then wait for explicit confirmation.

## Staging workflow

- Development: commit + push to `staging` automatically
- Testing: auto-deployed to Vercel Preview + Railway Staging on push
- Production: merge `staging` → `main` (requires explicit user direction)

## Repos

- Frontend: `C:\Users\axelj\casa-mx` → Vercel
- Backend: `C:\Users\axelj\casa-mx-backend` → Railway
