# Phase 3 Quick Start Guide

## Project Status
✅ **Phase 3 Complete** - Analytics, Admin Dashboard, Map Discovery
- 29 tests passing (0 failures)
- E2E tests configured with Playwright
- Build succeeds (11 optimized routes)
- Dev server running on http://localhost:3000

## Running the Project

```bash
# Install dependencies (if needed)
npm install

# Start dev server (manual)
npm run dev

# Run unit tests (Vitest)
npm run test

# Run Playwright E2E tests (manual - requires dev server to be running)
npm run test:e2e

# Run Playwright E2E tests (automatic - starts dev server, waits, and runs tests)
npm run test:e2e:auto

# Build for production
npm run build

# Preview production build
npm start
```

Notes:
- `npm test` now auto-terminates after 120s if it hangs. Override with `TEST_TIMEOUT_MS`.

## Demo Flow

### 1. Register a New User
- Visit http://localhost:3000/register
- Fill form: Name, Email, select Role(s)
- Click "Crear Cuenta"
- Redirects to /login

### 2. Approve as Admin
- First, register yourself as admin role
- Then manually approve in browser localStorage:
  - Open DevTools → Application → Local Storage
  - Find `casa-mx:1.0.0:users`
  - Edit JSON, change role status from "pending" → "approved"
  - Refresh page
- Visit http://localhost:3000/admin/approvals
- Approve other pending users

### 3. Login as User
- Visit http://localhost:3000/login
- Enter email and select approved role
- Click "Iniciar Sesión"
- Redirects to /properties
- NavBar shows user info, logout, and role-specific links

### 4. View Analytics Dashboard (Admin Only)
- Login as admin
- Visit http://localhost:3000/admin/analytics
- View charts: users by role, properties by status, event timeline
- Review recent activity feed

### 4.1 View Debug Sessions (Admin Only)
- Visit http://localhost:3000/admin/debug
- Open a session to see actions, errors, and API calls
- Use “Exportar reporte” to download JSON

### 5. Explore Properties on Map
- Visit http://localhost:3000/properties/map
- See properties with coordinates on interactive map
- Click markers to view popups with property details
- Click "Ver detalles" link to navigate to property page

## Key Files

### Auth System
- **Context:** `lib/auth/AuthContext.jsx` — Session management
- **Hook:** `lib/auth/useAuth.js` — Access auth in components
- **API:** `lib/api/auth.js` — User registration, login, logout

### Analytics System (Phase 3)
- **Core:** `lib/analytics/index.js` — Event tracking API
- **Hook:** `lib/analytics/useAnalytics.js` — Use in components
- **Providers:** `lib/analytics/providers/` — Pluggable backends
- **Events:** `lib/analytics/events.js` — Event name constants

### Pages
- **Login:** `app/login/page.js` — Email + role selector
- **Register:** `app/register/page.js` — Create account with roles
- **Admin Approvals:** `app/admin/approvals/page.js` — Approve pending roles
- **Admin Analytics:** `app/admin/analytics/page.jsx` — Metrics dashboard
- **Map:** `app/properties/map/page.js` — Interactive property map

### Guards
- **RequireAuth:** `components/guards/RequireAuth.jsx` — Protect routes
- **RequireRole:** `components/guards/RequireRole.jsx` — Role-based access

## Usage Examples

### Use Auth in Components
```jsx
'use client';
import { useAuth } from '@/lib/auth/useAuth';

export default function MyComponent() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Hello {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
}
```

### Protect Pages
```jsx
import { RequireAuth } from '@/components/guards/RequireAuth';
import { RequireRole } from '@/components/guards/RequireRole';

export default function AdminPage() {
  return (
    <RequireRole roles={['admin']}>
      <h1>Admin Dashboard</h1>
    </RequireRole>
  );
}
```

## Data Storage

All data stored in localStorage with versioned keys:
- `casa-mx:1.0.0:users` — User accounts with roles
- `casa-mx:1.0.0:session` — Current user session
- `casa-mx:1.0.0:properties` — Listing properties
- `casa-mx:1.0.0:requests` — Buyer requests
- `analytics.events` — Event tracking (max 200, FIFO eviction)

To clear all data:
```js
// In browser console
Object.keys(localStorage).forEach(k => 
  k.startsWith('casa-mx:') && localStorage.removeItem(k)
);
localStorage.removeItem('analytics.events');
```

## Environment Variables

Create `.env.local`:
```bash
# Analytics Configuration
NEXT_PUBLIC_ANALYTICS_ENABLED=true        # Enable/disable tracking (default: false)
NEXT_PUBLIC_ANALYTICS_PROVIDER=console    # Provider: console, noop (default: console)
```

## User Model

```js
{
  id: "user-1234567890",
  name: "Juan Pérez",
  email: "juan@example.com",
  roles: [
    { type: "seller", status: "approved" },
    { type: "buyer", status: "pending" }
  ],
  activeRole: "seller",
  createdAt: "2024-12-19T10:30:00.000Z"
}
```

## Available Roles

- **buyer** — Search and request property info
- **seller** — Upload properties for sale
- **wholesaler** — List properties as intermediary
- **admin** — Approve/reject user roles

## API Functions (Backend-Ready)

All functions in `lib/api/*.js` are async and ready to be replaced with API calls:

### Auth
- `register(payload)` — Create account
- `login(payload)` — Authenticate
- `logout()` — End session
- `getSession()` — Get current session
- `getUserById(id)` — Fetch user profile
- `getAllUsers()` — List all users

### Users (Admin)
- `getPendingApprovals()` — List pending roles
- `approveRole(payload)` — Approve role
- `rejectRole(payload)` — Reject role
- `getUserProfile(userId)` — Get user details

### Analytics (Phase 3)
- `trackEvent(eventName, payload)` — Track event
- `getRecentEvents(limit)` — Fetch recent events
- `clearEvents()` — Clear event history
- `isEnabled()` — Check if analytics enabled

## Testing

Run tests with: `npm test` (unit tests) and `npm run test:e2e:auto` (E2E tests)

Test files:
- `tests/lib/storage.test.js` — Storage API
- `tests/lib/auth.test.js` — Auth API
- `tests/lib/analytics.test.js` — Analytics API
- `tests/components/NavBar.test.jsx` — NavBar UI
- `tests/components/createMarker.test.jsx` — Marker helper
- `tests/e2e/map.spec.js` — Map interaction E2E
- `tests/e2e/a11y.spec.js` — Accessibility checks
- All Phase 1 & 2 tests still passing

## Troubleshooting

**Login not working?**
- Make sure you registered first
- Check role status in localStorage (must be "approved")
- Clear localStorage and start fresh

**Pages not loading?**
- Check dev server is running: `npm run dev`
- Clear `.next` folder: `rm -r .next`
- Restart dev server

**Tests failing?**
- Run: `npm test` to see verbose output
- Check imports match actual file structure
- Ensure all dependencies installed: `npm install`

**Analytics not tracking?**
- Check `.env.local` has `NEXT_PUBLIC_ANALYTICS_ENABLED=true`
- Open browser console to see events (if provider=console)
- View admin analytics dashboard: http://localhost:3000/admin/analytics

**Map not showing?**
- Ensure properties have `coordinates: { lat, lng }` in mock data
- Check browser console for Leaflet errors
- Try seeding properties with coordinates in `lib/mock/properties.js`

## Phase 3 Features

✅ **Analytics Layer**
- Pluggable provider pattern (console, noop, future: api)
- Event tracking with `useAnalytics()` hook
- Privacy toggle via environment variable

✅ **Admin Analytics Dashboard**
- Charts: users by role, properties by status, event timeline
- Recent activity feed (last 20 events)
- Route: http://localhost:3000/admin/analytics

✅ **Map-Based Property Discovery**
- Interactive Leaflet map with clustering
- Click markers for property preview popups
- Route: http://localhost:3000/properties/map

✅ **Testing & CI/CD**
- 29 unit tests passing (Vitest)
- E2E tests with Playwright (map, a11y)
- GitHub Actions workflows (unit on PR, E2E on merge)

## Next Features to Implement (Phase 4+)

1. **Search & Discovery Enhancements:** Add property filters (price, beds/baths, type), list/map toggle
2. **Update Phase 1 queries:** Switch from mock data to API layer
3. **Email verification:** Validate email on registration
4. **Password auth:** Add password field (currently email-only)
5. **User profile:** Create profile editing page
6. **Real API:** Replace mock functions with backend endpoints

---

**Questions?** Check [PHASE2_SUMMARY.md](./PHASE2_SUMMARY.md) for detailed documentation.
