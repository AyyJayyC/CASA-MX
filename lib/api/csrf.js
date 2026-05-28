/**
 * CSRF Token helper
 * Reads the _csrf cookie set by @fastify/csrf-protection
 * Must be sent as x-csrf-token header on all non-GET requests.
 */

export function getCsrfToken() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}
