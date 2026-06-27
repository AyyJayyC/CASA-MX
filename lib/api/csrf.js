/**
 * CSRF Token helper
 * Reads the _csrf cookie set by @fastify/csrf-protection
 * Must be sent as x-csrf-token header on all non-GET requests.
 *
 * NOTE: _csrf is intentionally NOT HttpOnly so client JS can read it.
 * This is safe because same-origin requests carry the cookie, and
 * cross-origin attackers cannot read cookie values from JavaScript.
 * This is the standard "double-submit cookie" CSRF pattern.
 */

export function getCsrfToken() {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}
