import { apiPost, apiGet, apiPatch } from './client';

export async function getAgencyPricing() {
  try {
    return (await apiGet('/agencies/pricing')).data;
  } catch { return null; }
}

export async function getPublicAgency(code) {
  try {
    return (await apiGet(`/agencies/public?code=${encodeURIComponent(code)}`)).data;
  } catch { return null; }
}

export async function getMyAgency() {
  try {
    return (await apiGet('/agencies/me')).data;
  } catch { return null; }
}

export async function getMyAgencyMembership() {
  try {
    return (await apiGet('/agencies/my-membership')).data;
  } catch { return null; }
}

export async function getMyAgents() {
  try {
    return (await apiGet('/agencies/me/agents')).data || [];
  } catch { return []; }
}

export async function getAdminAgencies() {
  try {
    return (await apiGet('/admin/agencies')).data || [];
  } catch { return []; }
}

export async function updateAgency(id, updates) {
  return (await apiPatch(`/admin/agencies/${id}`, updates)).data;
}

export async function createAgency(payload) {
  return (await apiPost('/agencies', payload)).data;
}

export async function addAgent(payload) {
  return (await apiPost('/agencies/me/agents', payload)).data;
}
