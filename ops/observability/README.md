# Self-hosted observability

Two decisions: **errors are self-hosted, analytics is already yours.**

## Errors — Bugsink

Bugsink is a single error tracker that speaks the Sentry protocol. The app keeps
`@sentry/nextjs`; only the DSN changes. No per-seat or per-event billing.

Why not the alternatives:

| Option | Resources | Verdict |
|---|---|---|
| **Bugsink** | 1 app container + Postgres | Chosen. Lightest real option |
| GlitchTip | 4 containers, 1–2 GB RAM | Fine, more moving parts |
| Self-hosted Sentry | ~20–40 containers, 16 GB+ RAM | Not for one developer |
| Sentry free tier | none | $0 but not self-hosted |

### Run it locally

```powershell
cd ops/observability
Copy-Item .env.example .env
# edit .env: secret key + superuser + db password
docker compose up -d
```

Open http://localhost:8000, log in with `BUGSINK_SUPERUSER`, create a project,
and copy its DSN (looks like `http://<key>@localhost:8000/1`).

### Point the app at it

In the frontend environment (Vercel for staging/production, `.env.local` locally):

```
NEXT_PUBLIC_SENTRY_DSN=http://<key>@<bugsink-host>/1
SENTRY_DSN=http://<key>@<bugsink-host>/1
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

Redeploy. The client DSN is inlined at build time, so changing the variable
without a redeploy does nothing. The backend uses `SENTRY_DSN` the same way.

CSP: `middleware.js` derives the DSN origin and appends it to `connect-src`, so
a self-hosted Bugsink on any domain works without editing the policy by hand.

Verify: the frontend and backend Sentry integrations should list a release and
receive a deliberately thrown error within a minute.

### Where to host it

- **Existing Docker host / VPS**: add this folder, `docker compose up -d`. No new cost.
- **Railway**: create the Bugsink service from `bugsink/bugsink:2` and point
  `DATABASE_URL` at a separate database on the Postgres you already pay for.
  Delete the `db` service in this file. One extra container, no new database fee.
- **Truly $0 with no ops**: Oracle Cloud Always Free ARM VM runs this whole
  compose file indefinitely. The trade-off is that you own patching and backups.

### Backups

The only state is the Postgres volume. Daily dump:

```powershell
docker compose exec db pg_dump -U bugsink bugsink > "bugsink-$(Get-Date -Format yyyy-MM-dd).sql"
```

Keep 7 days. Restore with `psql < dump.sql`.

### Upgrades

```powershell
docker compose pull
docker compose up -d
```

Pin the image tag (`bugsink/bugsink:2`) so a random `latest` cannot surprise you.

## Analytics — already self-hosted

Do not install Umami, Plausible, or PostHog. The app already has a first-party
pipeline that writes to your own Postgres:

- `lib/analytics/` → `POST /analytics/events`
- `AnalyticsEvent` table + aggregation service
- `/admin/analytics` dashboard (KPIs, timeline, top properties, referrals, events)

It is simply switched off and under-instrumented. To activate it:

```
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ANALYTICS_PROVIDER=api
```

Then ship the missing events (`PageView`, `PropertyViewed`, `SearchPerformed`,
`LeadUnlocked`, `OfferMade`, `ContractGenerated`, `CarouselImpression`,
`CarouselClick`) and make `POST /analytics/events` optional-auth so anonymous
traffic is counted. That work is in `docs/REBUILD_PLAN.md` under the
Observability track.

Keeping analytics first-party also means no third party receives behavioural
data from users who upload INE documents.

## Cost summary

| Item | New monthly cost |
|---|---|
| Bugsink (on an existing host) | $0 |
| Bugsink (new Railway container) | ~$5, may fit existing plan credit |
| Bugsink (Oracle Always Free) | $0, you own ops |
| Analytics | $0 — already your Postgres |
