# Maps API Control Strategy — Casa MX

Purpose: audit current maps usage and provide a practical control strategy to prevent unexpected charges while preserving functionality.

## 1) Current implementation (audit)

- Map rendering: Leaflet (direct integration) using OpenStreetMap (OSM) tiles. See `components/map/PropertyMap.jsx` (tile layer: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- Address/autocomplete/geocoding: Client-side calls in `components/PropertyUploadForm.jsx` to Google Web Services (Geocoding API, Places Autocomplete, Place Details) when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is present. The same component implements a Nominatim (OpenStreetMap) fallback.
- API key storage: frontend environment variable `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local`.
- Backend: no direct maps API calls detected in the backend codebase.
- Caching: none centralized. Frontend uses debouncing and fallback but does not persist geocoding results server-side.
- Rate limiting: none implemented at application level.

Conclusion: map tiles use OSM (no key). Geocoding and autocomplete optionally use Google (key present). Because calls are client-side, central monitoring and controls are not yet enforced.

## 2) Providers & constraints

- Tiles: OpenStreetMap (OSM). Free but donation-backed and subject to generous-but-finite rate limits. For production consider a paid tile provider or self-hosting tiles.
- Geocoding/Autocomplete: Google Maps Platform (Geocoding API, Places API) when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is present. Google requires billing enabled for these Web Services and bills per-SKU per-request; quotas and per-second limits apply.
- Fallback search/geocoding: Nominatim (OpenStreetMap public API). Usage policy forbids heavy/bulk use and client-side autocomplete polling; recommended max ~1 request/sec and caching. For scale, self-host or use commercial provider.

Authoritative docs consulted:
- Google Maps Platform — Pricing and SKUs (Geocoding / Places)
- Google Geocoding API — Usage and Billing
- Google Places API — Usage and Billing
- Nominatim usage policy and API docs

## 3) Short-term risks

- Client-side direct Google calls mean any browser can use the key (restricted by referrers if configured), and requests bypass server-side logging and limits.
- If the Google key is unrestricted or billing is enabled without quotas, accidental high usage or abuse may generate charges.
- Nominatim public endpoint will block heavy usage; client-side autocomplete that polls frequently can violate their policy.

## 4) Recommended control strategy (executive summary)

Goals: monitor usage (real-time), enforce rate limits, cache responses, provide graceful fallbacks, alert admins, and hard-stop before charges occur.

Priority (short-term):

1. Move all production geocoding/autocomplete calls behind a backend proxy/wrapper service. Benefits: central logging, caching, rate-limiting, ability to enforce hard-stop, and accurate cost calculation.
2. Add DB tables and Prisma migration to log requests and store limit definitions (ApiUsageLog, UsageLimit, LimitAlert). Seed sensible default free-tier limits. (Checkpoint 2)
3. Implement caching for geocoding/place results. Prefer Redis (if available). If Redis is not available, use a Postgres cache table with TTL or a memory cache with persistence to DB for critical entries.
4. Implement per-service rate limiting and circuit breaker in the backend wrapper (per-second limits, daily/monthly counters). When threshold crossed, send alerts and, if configured, hard-stop service.
5. Instrument usage aggregation and monitoring service to compute daily/monthly usage, projected cost, and trigger alerts at configured thresholds (e.g., 80%). (Checkpoint 3)
6. Frontend: query the backend for service status before rendering maps or calling autocomplete; implement client-side caching (React Query + localStorage) and exponential backoff on errors. Provide friendly Spanish fallback UI when maps are paused. (Checkpoint 5)
7. Admin: provide `/admin/maps` dashboard to view usage, edit limits, pause/resume services, export reports, and receive alerts (Checkpoint 4).

Optimization & cost prevention best-practices:
- Debounce and batch requests (client and server). Autocomplete: debounce 300–500ms and server-side protect with rate-limiter.
- Cache geocode results for 30 days (addresses rarely change). Cache autocomplete suggestions for 7 days.
- Use server-side aggregation to estimate end-of-month projected cost and send alerts early.
- Configure Google Cloud quota alerts and restrict API key usage by referrer and IP where appropriate.

Fallback rules:
- Primary: Google (if backend reports enabled and under limits).
- Fallback 1: Use cached result from Redis/Postgres.
- Fallback 2: Use Nominatim (but only for light, user-triggered single queries; do not use it for aggressive autocomplete). Respect Nominatim's User-Agent and attribution rules.
- Final fallback: show list view / textual address UX and clear Spanish message explaining temporary limitation.

## 5) Immediate next steps (Checkpoint 1 deliverable)

1. Create `MAPS_API_CONTROL_STRATEGY.md` (this file) and review it with the team.
2. Implement the Prisma migration and DB schema for usage logging (Checkpoint 2).
3. Implement a backend maps wrapper/proxy that logs and caches requests (Checkpoint 3). Initially route frontend autocomplete/geocode calls through this wrapper.
4. Add an admin dashboard skeleton at `/admin/maps` that reads usage and exposes simple pause/resume and limit editing UI (Checkpoint 4).

## 6) Notes & constraints

- Do not change map rendering technology (Leaflet + OSM tiles) — strategy preserves existing stacks.
- Keep frontend UX unchanged except to route web-service calls through backend proxy and to show fallback messaging when services paused.
- Tests must continue to pass: all code changes will include tests for new DB tables, wrapper behavior, caching, and admin routes.

---
Prepared by: engineering (automated audit)
