'use client';
import { useEffect } from 'react';
import { setItem, removeItem } from '@/lib/storage/storage';
import { trackReferralClick } from '@/lib/api/referrals';
import analytics from '@/lib/analytics';
import { EVENT_NAMES } from '@/lib/analytics/events';

export default function ReferralTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const compartio = params.get('compartio');
    const agencia = params.get('agencia');

    if (compartio) {
      setItem('referralCode', compartio);

      // Extract propertyId from path: /propiedades/ID
      const match = window.location.pathname.match(/\/propiedades\/([^/]+)/);
      const propertyId = match ? match[1] : null;

      trackReferralClick({ referralCode: compartio, propertyId });
      analytics.trackEvent(EVENT_NAMES.REFERRAL_CLICK, { entityId: propertyId, metadata: { referralCode: compartio } });
    }

    if (agencia) {
      setItem('agencyCode', agencia);
    }
  }, []);

  return null;
}
