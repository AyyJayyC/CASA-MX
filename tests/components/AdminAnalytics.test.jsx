import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminAnalyticsPage from '../../app/admin/analytics/page';
import { describe, it, beforeEach, vi } from 'vitest';

vi.mock('../../components/guards/RequireRole.jsx', () => ({
  RequireRole: ({ children }) => <div>{children}</div>
}));

vi.mock('../../lib/analytics', () => ({
  getRecentEvents: () => [
    { eventName: 'PropertyViewed', timestamp: new Date().toISOString(), userId: 'u1', activeRole: 'seller', entityId: 'p1', metadata: {} }
  ],
  trackEvent: () => null,
  default: {
    getRecentEvents: () => [
      { eventName: 'PropertyViewed', timestamp: new Date().toISOString(), userId: 'u1', activeRole: 'seller', entityId: 'p1', metadata: {} }
    ],
    trackEvent: () => null
  }
}));

vi.mock('../../lib/storage/storage', () => ({
  getItem: (k) => {
    if (k === 'users') return [{ id: 'u1', roles: [{ type: 'seller' }] }];
    if (k === 'properties') return [{ id: 'p1', status: 'active' }];
    return [];
  }
}));

describe('AdminAnalyticsPage', () => {
  beforeEach(() => {});

  it('renders charts and activity feed', () => {
    render(<AdminAnalyticsPage />);

    expect(screen.getByText(/Admin Analytics/i)).toBeDefined();
    expect(screen.getByText(/Users by Role/i)).toBeDefined();
    expect(screen.getByText(/Properties by Status/i)).toBeDefined();
    expect(screen.getByText(/Recent Activity/i)).toBeDefined();
  });
});
