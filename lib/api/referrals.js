const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

import { refreshAccessToken } from './auth';

async function fetchWithAuthRetry(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    headers: options.headers || {},
    credentials: 'include',
  });

  if (response.status !== 401) {
    return response;
  }

  try {
    const refreshed = await refreshAccessToken();
    if (!refreshed?.success) {
      return response;
    }

    return fetch(url, {
      ...options,
      headers: options.headers || {},
      credentials: 'include',
    });
  } catch {
    return response;
  }
}

export async function getMyReferralCode() {
  try {
    const response = await fetchWithAuthRetry(`${BACKEND_URL}/referrals/my-code`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data?.referralCode || null;
  } catch {
    return null;
  }
}

export async function trackReferralClick({ referralCode, propertyId }) {
  try {
    await fetch(`${BACKEND_URL}/referrals/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode, propertyId }),
    });
  } catch {
  }
}

export async function getReferralStats() {
  try {
    const response = await fetchWithAuthRetry(`${BACKEND_URL}/referrals/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data || null;
  } catch {
    return null;
  }
}
