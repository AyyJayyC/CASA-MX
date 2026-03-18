/**
 * React Query hooks for analytics
 * Purpose: Expose backend analytics endpoints for admin dashboard components.
 */
import { useQuery } from '@tanstack/react-query';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

async function fetchAnalyticsSummary() {
  const response = await fetch(`${BACKEND_URL}/admin/analytics/summary`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch analytics summary');
  const data = await response.json();
  return data.data;
}

async function fetchAnalyticsEvents(limit = 200) {
  const response = await fetch(
    `${BACKEND_URL}/admin/analytics/events?limit=${limit}`,
    {
      headers: authHeaders(),
      credentials: 'include',
    }
  );
  if (!response.ok) throw new Error('Failed to fetch analytics events');
  const data = await response.json();
  return data.data || [];
}

export const ANALYTICS_KEYS = {
  summary: ['analytics', 'summary'],
  events: (limit) => ['analytics', 'events', limit],
};

/**
 * useAnalyticsSummary — returns aggregated event counts from backend
 * Admin-only endpoint.
 */
export function useAnalyticsSummary() {
  return useQuery(ANALYTICS_KEYS.summary, fetchAnalyticsSummary, {
    staleTime: 1000 * 60 * 5, // 5 min — summary data changes slowly
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * useAnalyticsEvents — returns the most recent N raw events from backend
 * @param {number} limit
 * Admin-only endpoint.
 */
export function useAnalyticsEvents(limit = 200) {
  return useQuery(
    ANALYTICS_KEYS.events(limit),
    () => fetchAnalyticsEvents(limit),
    {
      staleTime: 1000 * 60 * 2, // 2 min
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );
}
