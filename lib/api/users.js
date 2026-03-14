/**
 * Users API (real backend integration)
 * Purpose: Manage user profiles and admin approvals through backend endpoints.
 */

const BACKEND_URL = 'http://localhost:3001';

function getAccessToken() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem('accessToken');
}

function authHeaders() {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function normalizeErrorMessage(status, fallback = 'Request failed') {
  if (status === 401) return 'Unauthorized';
  if (status === 403) return 'Forbidden';
  if (status === 404) return 'Resource not found';
  return fallback;
}

/**
 * Get all users with pending roles
 * @returns {Promise<array>}
 */
export async function getPendingApprovals() {
  const response = await fetch(`${BACKEND_URL}/admin/pending-roles`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || normalizeErrorMessage(response.status, 'Failed to fetch pending approvals'));
  }

  const data = await response.json();
  return (data.data || []).map((item) => ({
    id: item.id,
    userId: item.user?.id,
    userName: item.user?.name,
    userEmail: item.user?.email,
    roleType: item.role?.name,
    requestedAt: item.createdAt,
    status: item.status,
  }));
}

/**
 * Approve a user's role
 * @param {{userId, roleType}} payload
 * @returns {Promise<user>}
 */
export async function approveRole(payload) {
  const pending = await getPendingApprovals();
  const match = pending.find(
    (item) => item.userId === payload.userId && item.roleType === payload.roleType
  );

  if (!match) {
    throw new Error('Role assignment not found');
  }

  const response = await fetch(`${BACKEND_URL}/admin/roles/${match.id}/approve`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || normalizeErrorMessage(response.status, 'Failed to approve role'));
  }

  const data = await response.json();
  return data.data;
}

/**
 * Reject a user's role
 * @param {{userId, roleType}} payload
 * @returns {Promise<user>}
 */
export async function rejectRole(payload) {
  const pending = await getPendingApprovals();
  const match = pending.find(
    (item) => item.userId === payload.userId && item.roleType === payload.roleType
  );

  if (!match) {
    throw new Error('Role assignment not found');
  }

  const response = await fetch(`${BACKEND_URL}/admin/roles/${match.id}/deny`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || normalizeErrorMessage(response.status, 'Failed to reject role'));
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get user profile (current or by ID)
 * @param {string} userId
 * @returns {Promise<user>}
 */
export async function getUserProfile(userId) {
  const endpoint = userId ? `${BACKEND_URL}/users/${userId}` : `${BACKEND_URL}/users/me`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || normalizeErrorMessage(response.status, 'Failed to fetch user profile'));
  }

  const data = await response.json();
  return data.data || null;
}

/**
 * Update current user profile
 * @param {{name?: string, email?: string}} payload
 * @returns {Promise<object>}
 */
export async function updateUserProfile(payload) {
  const response = await fetch(`${BACKEND_URL}/users/me`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || normalizeErrorMessage(response.status, 'Failed to update user profile'));
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get audit logs (admin only)
 * @param {{limit?: number}} options
 * @returns {Promise<array>}
 */
export async function getAuditLogs({ limit = 100 } = {}) {
  const response = await fetch(`${BACKEND_URL}/admin/audit-logs?limit=${limit}`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || normalizeErrorMessage(response.status, 'Failed to fetch audit logs'));
  }

  const data = await response.json();
  return data.data || [];
}

