/**
 * Shared API client — single source of truth for all backend HTTP calls.
 * Provides built-in CSRF, auth refresh, and error normalization.
 */
import { getCsrfToken } from "./csrf";
import { refreshAccessToken } from "./auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

let refreshPromise = null;

function csrfHeaders(base = {}) {
  const token = getCsrfToken();
  return token ? { ...base, "x-csrf-token": token } : base;
}

/**
 * Low-level fetch with automatic CSRF and 401 token refresh.
 */
export async function apiFetch(
  path,
  { method = "GET", body, headers = {}, ...opts } = {},
) {
  const finalHeaders =
    method !== "GET"
      ? csrfHeaders({ "Content-Type": "application/json", ...headers })
      : { ...headers };

  let res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: finalHeaders,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
    ...opts,
  });

  if (res.status === 401) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const refreshed = await refreshPromise;
      if (refreshed?.success) {
        res = await fetch(`${BACKEND_URL}${path}`, {
          method,
          headers: finalHeaders,
          credentials: "include",
          body: body ? JSON.stringify(body) : undefined,
          ...opts,
        });
      }
    } catch {
      fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    }
  }

  return res;
}

/**
 * Parse a response, throwing a descriptive Error on non-ok status.
 */
export async function parseResponse(
  response,
  fallbackMessage = "Request failed",
) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.details?.[0]?.message;
    const err = new Error(
      detail || payload?.error || payload?.message || fallbackMessage,
    );
    err.status = response.status;
    err.data = payload;
    throw err;
  }
  return payload;
}

/**
 * Convenience: GET request → parsed JSON (throws on error).
 */
export async function apiGet(path, opts = {}) {
  const res = await apiFetch(path, { ...opts, method: "GET" });
  return parseResponse(res, `GET ${path} failed`);
}

/**
 * Convenience: POST request → parsed JSON (throws on error).
 */
export async function apiPost(path, body, opts = {}) {
  const res = await apiFetch(path, { ...opts, method: "POST", body });
  return parseResponse(res, `POST ${path} failed`);
}

/**
 * Convenience: PATCH request → parsed JSON (throws on error).
 */
export async function apiPatch(path, body, opts = {}) {
  const res = await apiFetch(path, { ...opts, method: "PATCH", body });
  return parseResponse(res, `PATCH ${path} failed`);
}

/**
 * Convenience: DELETE request → parsed JSON (throws on error).
 */
export async function apiDelete(path, opts = {}) {
  const res = await apiFetch(path, { ...opts, method: "DELETE" });
  return parseResponse(res, `DELETE ${path} failed`);
}

export { BACKEND_URL };
