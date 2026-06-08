import { apiPost, apiGet, apiPatch } from "./client";
import { BACKEND_URL } from "./client";
import { getCsrfToken } from "./csrf";

export async function getPendingApprovals() {
  const data = await apiGet("/admin/pending-roles");
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

export async function approveRole(payload) {
  const pending = await getPendingApprovals();
  const match = pending.find(
    (item) =>
      item.userId === payload.userId && item.roleType === payload.roleType,
  );
  if (!match) throw new Error("Role assignment not found");
  return (await apiPost(`/admin/roles/${match.id}/approve`)).data;
}

export async function rejectRole(payload) {
  const pending = await getPendingApprovals();
  const match = pending.find(
    (item) =>
      item.userId === payload.userId && item.roleType === payload.roleType,
  );
  if (!match) throw new Error("Role assignment not found");
  return (await apiPost(`/admin/roles/${match.id}/deny`)).data;
}

export async function getPendingUserDocuments() {
  const res = await apiGet("/admin/user-documents/pending");
  return res.data || [];
}

export async function approveUserDocument(documentId, note) {
  return (
    await apiPost(
      `/admin/user-documents/${documentId}/approve`,
      note ? { note } : {},
    )
  ).data;
}

export async function rejectUserDocument(documentId, note) {
  return (
    await apiPost(
      `/admin/user-documents/${documentId}/reject`,
      note ? { note } : {},
    )
  ).data;
}

export async function getUserProfile(userId) {
  try {
    const endpoint = userId ? `/users/${userId}` : "/users/me";
    const res = await apiGet(endpoint);
    return res.data || null;
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

export async function updateUserProfile(payload) {
  return (await apiPatch("/users/me", payload)).data;
}

export async function uploadProfileAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = getCsrfToken();
  const headers = token ? { "x-csrf-token": token } : {};

  const response = await fetch(`${BACKEND_URL}/users/me/avatar`, {
    method: "POST",
    credentials: "include",
    headers,
    body: formData,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || "Failed to upload profile avatar");
  }
  return payload.data;
}

export async function getAuditLogs({ limit = 100 } = {}) {
  const res = await apiGet(`/admin/audit-logs?limit=${limit}`);
  return res.data || [];
}
