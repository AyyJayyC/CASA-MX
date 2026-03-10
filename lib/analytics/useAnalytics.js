'use client';

import { useCallback } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import analytics from './index';

export function useAnalytics() {
  const { session, user } = useAuth();

  const track = useCallback((eventName, details = {}) => {
    const context = {
      userId: user?.id || session?.userId || null,
      activeRole: session?.activeRole || null
    };
    return analytics.trackEvent(eventName, details, context);
  }, [session, user]);

  return {
    track
  };
}

export default useAnalytics;
