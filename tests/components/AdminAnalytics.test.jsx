import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminAnalyticsPage from '../../app/admin/analytics/page';
import { describe, it, beforeEach, vi } from 'vitest';

vi.mock('../../components/guards/RequireRole.jsx', () => ({
  RequireRole: ({ children }) => <div>{children}</div>
}));

const fakeDashboard = {
  users: { total: 100, newThisWeek: 10 },
  properties: { total: 50, newThisWeek: 5 },
  usersByRole: { owner: 40, client: 30, agency: 20, agent: 10 },
  propertiesByStatus: { active: 30, pending: 10, sold: 5, rented: 5 },
};

const fakeTimeline = {
  dates: ['2024-01-01', '2024-01-02'],
  users: [10, 12],
  properties: [2, 3],
  contactRequests: [1, 2],
  referralClicks: [5, 6],
  referralSignups: [1, 1],
  creditRevenue: [100, 200],
};

globalThis.fetch = vi.fn((url) => {
  const urlStr = String(url);
  if (urlStr.includes('/admin/analytics/dashboard')) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: fakeDashboard }) });
  }
  if (urlStr.includes('/admin/analytics/timeline')) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: fakeTimeline }) });
  }
  if (urlStr.includes('/admin/analytics/top-properties')) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) });
  }
  if (urlStr.includes('/admin/analytics/referral-summary')) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: { totalClicks: 50, totalSignups: 10, conversionRate: 20 } }) });
  }
  if (urlStr.includes('/admin/analytics/events')) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: null }) });
});

describe('AdminAnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders charts and activity feed', async () => {
    render(<AdminAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Dashboard de Análisis/i)).toBeDefined();
    });

    expect(screen.getByText(/Usuarios por rol/i)).toBeDefined();
    expect(screen.getByText(/Propiedades por estado/i)).toBeDefined();
    expect(screen.getAllByText(/Actividad reciente/i).length).toBeGreaterThanOrEqual(1);
  });
});
