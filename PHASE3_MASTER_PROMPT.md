# CASA MX FRONTEND - PHASE 3 MASTER PROMPT

**Date**: January 13, 2026  
**Status**: ✅ Complete  
**Context**: This document preserves the complete Phase 3 specification including Phase 1 & Phase 2 context.

---

## Phase 1 & 2 Context (Preserved)

### Phase 1: Foundation
- Next.js 13 App Router setup with Tailwind CSS
- Mock data layer with localStorage persistence
- Property listing, upload, and request flows
- React Query for data fetching
- Vitest + Testing Library for unit tests
- Spanish UI, English internal comments

### Phase 2: Authentication System
- Multi-role authentication (buyer, seller, wholesaler, admin)
- Role approval workflow (pending → approved/rejected)
- Auth context + useAuth hook
- Route guards (RequireAuth, RequireRole)
- Session management via localStorage
- Admin approval dashboard at /admin/approvals
- 21 passing tests, full build success

---

## Phase 3: Analytics, Admin Dashboard, Map Discovery

### Goals
1. **Analytics & Event Tracking**: Pluggable, privacy-conscious event tracking
2. **Admin Analytics Dashboard**: Visualize user activity and system metrics
3. **Map-Based Property Discovery**: Interactive map with markers and clustering
4. **Search & Discovery Enhancements**: Filters and list/map toggle
5. **UX & Reliability**: Loading states, error boundaries, graceful degradation
6. **Comprehensive Testing**: Unit, integration, and E2E tests

---

## 1. Analytics Layer

### Requirements
- **Pluggable provider pattern**: Swap analytics backends (console, API, third-party)
- **Privacy-first**: Toggle on/off via environment variable
- **Structured events**: Canonical event names and payload format
- **Local persistence**: Queue events in localStorage (bounded, 200 max)
- **Frontend-only**: No backend required initially (backend-ready design)

### Implementation

**Files Created**:
- `lib/analytics/index.js` - Core analytics API
- `lib/analytics/events.js` - Event name constants
- `lib/analytics/providers/consoleProvider.js` - Console logging provider
- `lib/analytics/providers/noopProvider.js` - Disabled/noop provider
- `lib/analytics/useAnalytics.js` - React hook for components

**API**:
```js
import { trackEvent, getRecentEvents, clearEvents, isEnabled } from '@/lib/analytics';

// Track an event
trackEvent('PropertyViewed', { entityId: 'p123', metadata: { title: 'Casa' } });

// Get recent events (admin dashboard)
const events = getRecentEvents(50);

// Check if enabled
if (isEnabled()) { /* ... */ }
```

**Environment Variables**:
- `NEXT_PUBLIC_ANALYTICS_ENABLED=true` - Enable/disable tracking
- `NEXT_PUBLIC_ANALYTICS_PROVIDER=console` - Provider choice (console, noop, future: api)

**Event Structure**:
```js
{
  eventName: 'PropertyViewed',
  timestamp: '2026-01-13T06:00:00.000Z',
  userId: 'user-123',
  activeRole: 'buyer',
  entityId: 'p123',
  metadata: { title: 'Casa', via: 'map' }
}
```

**Storage**:
- Key: `analytics.events`
- Bounded queue (max 200 events, FIFO eviction)
- Uses existing `lib/storage/storage.js` layer

---

## 2. Admin Analytics Dashboard

### Requirements
- Route: `/admin/analytics`
- Protected by `RequireRole roles={['admin']}`
- Display metrics: user count by role, property count by status, event timeline
- Use Recharts for visualizations
- Include recent activity feed

### Implementation

**Files Created**:
- `app/admin/analytics/page.jsx` - Dashboard page
- `components/analytics/ActivityFeed.jsx` - Recent events list

**Features**:
- **Charts**: PieChart (users by role), BarChart (properties by status), LineChart (events over time)
- **Activity Feed**: Last 20 events with timestamps and details
- **Frontend aggregation**: All metrics calculated client-side from localStorage

**Charts Library**: Recharts
- Lightweight, composable
- Responsive containers
- TypeScript-ready

---

## 3. Map-Based Property Discovery

### Requirements
- Route: `/properties/map`
- Display properties with coordinates on interactive map
- Clustering for dense areas
- Click marker → show popup with property preview
- Gracefully handle missing coordinates
- No API keys exposed (use OSM tiles)
- Error boundary to prevent crashes

### Implementation

**Files Created**:
- `components/map/PropertyMap.jsx` - Leaflet map component
- `components/map/createMarker.js` - Testable marker helper
- `app/properties/map/page.js` - Map route
- `components/ErrorBoundary.jsx` - Error boundary wrapper
- `components/analytics/PropertyAnalytics.jsx` - Auto-track property views

**Library Choice**: Leaflet + leaflet.markercluster
- **Why not react-leaflet**: Requires React 19 (peer dependency issue)
- **Direct Leaflet**: More control, smaller bundle, works with React 18

**Features**:
- OSM tile layer (no API key required)
- Marker clustering via leaflet.markercluster
- Popup with property title, address, and "View details" link
- Click tracking via analytics layer
- Empty state when no coordinates available

**Map Integration**:
```jsx
import PropertyMap from '@/components/map/PropertyMap';

<PropertyMap center={[19.4326, -99.1332]} zoom={6} />
```

---

## 4. Search & Discovery Enhancements (Optional)

### Planned Features (Not Implemented Yet)
- Property filters: price range, type, beds/baths
- List ↔ Map view toggle
- Filter state managed via URL params
- Integrate with existing `useProperties` query

**Note**: Deferred to Phase 4 or future iteration.

---

## 5. UX & Reliability Improvements

### Implemented
- **Error Boundaries**: Wrap map and analytics components
- **Empty States**: "No properties with coordinates" message on map
- **Loading States**: Implicit via React Query (existing)
- **Graceful Degradation**: Analytics errors don't break UX

### Files
- `components/ErrorBoundary.jsx`
- Empty state messaging in `app/properties/map/page.js`

---

## 6. Comprehensive Testing

### Unit Tests (Vitest + Testing Library)
- `tests/lib/analytics.test.js` - Analytics API (enabled/disabled modes)
- `tests/components/createMarker.test.jsx` - Marker helper logic
- `tests/components/AdminAnalytics.test.jsx` - Dashboard rendering
- `tests/components/PropertyAnalytics.test.jsx` - Auto-tracking

### Integration Tests
- Existing tests for Phase 1 & 2 flows still pass
- Total: 29 tests passing

### E2E Tests (Playwright)
- `tests/e2e/map.spec.js` - Map page interaction (marker click, popup navigation)
- `tests/e2e/a11y.spec.js` - Accessibility checks (axe-core) on map, home, login

**Test Scripts**:
```bash
npm test                   # Vitest unit tests
npm run test:e2e           # Playwright (manual - requires dev server)
npm run test:e2e:auto      # Playwright (auto - starts dev server)
npm run test:e2e:headed    # Playwright headed mode
```

**CI/CD**:
- `.github/workflows/unit-tests.yml` - Fast unit tests on every PR
- `.github/workflows/e2e.yml` - E2E + a11y on merge to main (with retry: 1)

---

## Architecture Decisions

### Analytics Provider Pattern
**Decision**: Pluggable provider with runtime toggle  
**Rationale**: Allows swapping backends (console → API → third-party) without changing consumer code. Privacy toggle at runtime.

### Leaflet vs react-leaflet
**Decision**: Use Leaflet directly  
**Rationale**: react-leaflet requires React 19; direct Leaflet works with React 18 and gives more control.

### Frontend-Only Analytics
**Decision**: Store events in localStorage, calculate metrics client-side  
**Rationale**: Backend-ready design; can migrate to API later without changing component contracts.

### CI Strategy
**Decision**: Separate unit and E2E jobs; E2E only on merge  
**Rationale**: Fast feedback on PRs (unit tests ~1min); expensive E2E runs only on merge/nightly.

### Clustering
**Decision**: Use leaflet.markercluster  
**Rationale**: Handles dense areas, mature library, no extra complexity.

---

## File Structure (Phase 3 Additions)

```
lib/
  analytics/
    index.js                    # Core analytics API
    events.js                   # Event name constants
    useAnalytics.js             # React hook
    providers/
      consoleProvider.js        # Console provider
      noopProvider.js           # Disabled provider
components/
  analytics/
    ActivityFeed.jsx            # Recent events list
    PropertyAnalytics.jsx       # Auto-track property views
  map/
    PropertyMap.jsx             # Leaflet map component
    createMarker.js             # Testable marker helper
  ErrorBoundary.jsx             # Error boundary wrapper
app/
  admin/
    analytics/
      page.jsx                  # Admin analytics dashboard
  properties/
    map/
      page.js                   # Map route
tests/
  lib/
    analytics.test.js           # Analytics unit tests
  components/
    createMarker.test.jsx       # Marker helper tests
    AdminAnalytics.test.jsx     # Dashboard tests
    PropertyAnalytics.test.jsx  # Auto-tracking tests
  e2e/
    map.spec.js                 # E2E map interaction
    a11y.spec.js                # Accessibility checks
.github/
  workflows/
    unit-tests.yml              # Fast unit tests on PR
    e2e.yml                     # E2E on merge
```

---

## Environment Variables

### Analytics
- `NEXT_PUBLIC_ANALYTICS_ENABLED=true|false` - Enable/disable tracking (default: false)
- `NEXT_PUBLIC_ANALYTICS_PROVIDER=console|noop` - Provider choice (default: console)

### Setup
Create `.env.local`:
```bash
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ANALYTICS_PROVIDER=console
```

---

## Testing Strategy

### Unit Tests
- **What**: Pure logic, isolated components
- **When**: Every commit
- **Coverage**: Analytics API, marker helpers, dashboard aggregation

### Integration Tests
- **What**: Component interactions, DOM behavior
- **When**: Every commit
- **Coverage**: Analytics + auth, map + routing

### E2E Tests
- **What**: Real browser flows, visual regression
- **When**: Merge to main, nightly
- **Coverage**: Map discovery, a11y checks

### Accessibility
- **Tool**: @axe-core/playwright
- **Coverage**: Map, home, login pages
- **When**: Part of E2E suite

---

## Migration Notes

### Adding New Analytics Events
1. Add constant to `lib/analytics/events.js`
2. Call `track()` from component via `useAnalytics()`
3. Event auto-persists to localStorage
4. Appears in admin dashboard activity feed

### Adding New Analytics Provider
1. Create provider file in `lib/analytics/providers/`
2. Export `async sendEvent(payload)` function
3. Update `lib/analytics/index.js` to load provider
4. Set `NEXT_PUBLIC_ANALYTICS_PROVIDER=yourprovider`

### Disabling Analytics
Set `NEXT_PUBLIC_ANALYTICS_ENABLED=false` in `.env.local`

### Backend Migration (Future)
1. Create API endpoint: `POST /api/analytics/events`
2. Add `apiProvider.js` that calls endpoint
3. Switch provider: `NEXT_PUBLIC_ANALYTICS_PROVIDER=api`
4. Remove localStorage persistence (optional)

---

## Success Criteria ✅

- [x] Analytics layer implemented with pluggable providers
- [x] Admin analytics dashboard with charts and activity feed
- [x] Map page with Leaflet, clustering, and popups
- [x] Error boundaries and empty states
- [x] 29 tests passing (unit + integration)
- [x] E2E tests for map interaction and a11y
- [x] CI/CD with separate unit and E2E jobs
- [x] Documentation (README, QUICKSTART, this file)

---

## Known Limitations & Future Work

### Current Limitations
1. **No property filters**: Planned for Phase 4
2. **No list/map toggle**: Planned for Phase 4
3. **Client-side metrics only**: Backend aggregation future enhancement
4. **Limited E2E coverage**: Only map flow covered; expand to upload/register

### Future Enhancements
1. Add property filters (price, beds/baths, type)
2. Implement backend analytics API
3. Add more E2E scenarios (upload, register, admin approval)
4. Optimize Leaflet bundle size (code-split/lazy load)
5. Add real-time notifications for role approvals
6. Implement email verification

---

## Phase 4 Preview (Tentative)

### Planned Features
- Advanced search with filters
- Saved searches and favorites
- Real-time notifications
- Email verification
- Backend API integration (replace localStorage)
- User profile editing
- Property image galleries
- Advanced admin tools (user management, content moderation)

---

**Questions or issues?** Check `PHASE3_SUMMARY.md` for implementation details and migration guide.
