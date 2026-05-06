'use client';

import { useEffect } from 'react';
import useAnalytics from '@/lib/analytics/useAnalytics';

export default function PropertyAnalytics({ propertyId }) {
  const { track } = useAnalytics();

  useEffect(() => {
    if (!propertyId) return;
    try {
      track('PropertyViewed', { entityId: propertyId, metadata: { via: 'detail.page' } });
    } catch (err) {
      // Don't crash the page if analytics fails
      console.error('PropertyAnalytics track error:', err);
    }
  }, [propertyId, track]);

  return null;
}
