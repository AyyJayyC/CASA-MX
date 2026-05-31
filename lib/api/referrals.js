import { apiGet } from './client';
import { apiFetch } from './client';

export async function getMyReferralCode() {
  try {
    const res = await apiGet('/referrals/my-code');
    return res?.data?.referralCode || null;
  } catch {
    return null;
  }
}

export async function trackReferralClick({ referralCode, propertyId }) {
  try {
    await apiFetch('/referrals/click', {
      method: 'POST',
      body: { referralCode, propertyId },
    });
  } catch {
    // fire-and-forget
  }
}

export async function getReferralStats() {
  try {
    const res = await apiGet('/referrals/stats');
    return res?.data || null;
  } catch {
    return null;
  }
}
