# E2E tests

## Run locally

Both servers must be up:

1. **Backend** (Docker is easiest):
   ```powershell
   cd ..\casa-mx-backend
   docker compose up -d postgres redis backend
   ```
2. **Frontend**:
   ```powershell
   npm run dev
   ```
3. **Seed the test accounts** used by the specs:
   - `admin@casamx.local` / `admin123`
   - `seller@casamx.local` / `seller123`
   - `buyer@casamx.local` / `buyer123`

   `prisma/seed.ts` uses different default passwords. Set
   `SEED_ADMIN_PASSWORD`, `SEED_OWNER_PASSWORD`, `SEED_CLIENT_PASSWORD` before
   seeding, or update the three users afterwards. The backend test setup
   (`tests/setup.ts`) already normalizes them for `casamx_test`.

4. **Run**:
   ```powershell
   npx playwright test
   ```

## Rules

- **Always serial.** The suite shares one backend, one database and three
  seeded users. Parallel workers race on login and refresh-token rotation.
  `playwright.config.js` sets `workers: 1` for this reason.
- **CSRF is enforced.** API-based tests must call `GET /auth/csrf` after login
  and send `x-csrf-token` on mutations. See `integrity.spec.ts`.
- **Do not assert `expect(x || true)`.** The upload spec used to; it hid a
  disabled submit button for an entire release.
- `production-smoke.spec.ts` is misnamed: it targets `PLAYWRIGHT_BASE_URL`
  (localhost by default), not production. Set that variable to smoke a real
  deployment.
