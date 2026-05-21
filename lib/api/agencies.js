const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

import { refreshAccessToken } from './auth';

async function fetchWithAuthRetry(url, options = {}) {
  let response = await fetch(url, { ...options, headers: options.headers || {}, credentials: 'include' });
  if (response.status !== 401) return response;
  try {
    const refreshed = await refreshAccessToken();
    if (!refreshed?.success) return response;
    return fetch(url, { ...options, headers: options.headers || {}, credentials: 'include' });
  } catch { return response; }
}

export async function getAgencyPricing() {
  try {
    const res = await fetch(`${BACKEND_URL}/agencies/pricing`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch { return null; }
}

export async function getPublicAgency(code) {
  try {
    const res = await fetch(`${BACKEND_URL}/agencies/public?code=${encodeURIComponent(code)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch { return null; }
}

export async function getMyAgency() {
  try {
    const res = await fetchWithAuthRetry(`${BACKEND_URL}/agencies/me`, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch { return null; }
}

export async function getMyAgencyMembership() {
  try {
    const res = await fetchWithAuthRetry(`${BACKEND_URL}/agencies/my-membership`, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch { return null; }
}

export async function getMyAgents() {
  try {
    const res = await fetchWithAuthRetry(`${BACKEND_URL}/agencies/me/agents`, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch { return []; }
}

export async function getAdminAgencies() {
  try {
    const res = await fetchWithAuthRetry(`${BACKEND_URL}/admin/agencies`, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch { return []; }
}

export async function updateAgency(id, updates) {
  const res = await fetchWithAuthRetry(`${BACKEND_URL}/admin/agencies/${id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || 'Error');
  return json.data;
}
