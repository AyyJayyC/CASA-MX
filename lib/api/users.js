/**
 * Users API (real backend integration)
 * Purpose: Manage user profiles and admin approvals through backend endpoints.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function authHeaders({ includeJsonContentType = false } = {}) {
  if (!includeJsonContentType) {
    return {};
  }

  return {
    'Content-Type': 'application/json',
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

export async function getPendingUserDocuments() {
  const response = await fetch(`${BACKEND_URL}/admin/user-documents/pending`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || normalizeErrorMessage(response.status, 'Failed to fetch pending user documents'));
  }

  const data = await response.json();
  return data.data || [];
}

export async function approveUserDocument(documentId, note) {
  const response = await fetch(`${BACKEND_URL}/admin/user-documents/${documentId}/approve`, {
    method: 'POST',
    headers: authHeaders({ includeJsonContentType: true }),
    credentials: 'include',
    body: JSON.stringify(note ? { note } : {}),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || normalizeErrorMessage(response.status, 'Failed to approve user document'));
  }

  const data = await response.json();
  return data.data;
}

export async function rejectUserDocument(documentId, note) {
  const response = await fetch(`${BACKEND_URL}/admin/user-documents/${documentId}/reject`, {
    method: 'POST',
    headers: authHeaders({ includeJsonContentType: true }),
    credentials: 'include',
    body: JSON.stringify(note ? { note } : {}),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || normalizeErrorMessage(response.status, 'Failed to reject user document'));
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
    const error = new Error(data?.error || normalizeErrorMessage(response.status, 'Failed to fetch user profile'));
    error.status = response.status;
    throw error;
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
    headers: authHeaders({ includeJsonContentType: true }),
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

export async function uploadProfileAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BACKEND_URL}/users/me/avatar`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || normalizeErrorMessage(response.status, 'Failed to upload profile avatar'));
  }

  return payload.data;
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

