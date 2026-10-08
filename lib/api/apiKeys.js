import { apiGet, apiPost, apiDelete } from "./client";

/** List the authenticated user's publisher API keys (metadata only). */
export async function listApiKeys() {
  const res = await apiGet("/users/me/api-keys");
  return res.data || [];
}

/** Create a key. Returns { id, label, key, prefix, warning? } — `key` is shown once. */
export async function createApiKey(label) {
  return (await apiPost("/users/me/api-keys", { label })).data;
}

/** Revoke (deactivate) one of the user's keys. Idempotent. */
export async function revokeApiKey(id) {
  return (await apiDelete(`/users/me/api-keys/${id}`)).data;
}
