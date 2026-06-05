import { BACKEND_URL } from './client';
import { getCsrfToken } from './csrf';

export async function getTagSubscriptions() {
  const csrf = getCsrfToken();
  const res = await fetch(`${BACKEND_URL}/users/tags`, {
    credentials: 'include',
    headers: csrf ? { 'x-csrf-token': csrf } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to fetch tag subscriptions');
  }
  const data = await res.json();
  return data.subscriptions || [];
}

export async function addTagSubscription(tagType, tagName, estado) {
  const csrf = getCsrfToken();
  const res = await fetch(`${BACKEND_URL}/users/tags`, {
    method: 'POST',
    credentials: 'include',
    headers: { ...(csrf ? { 'x-csrf-token': csrf } : {}), 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagType, tagName, estado }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to add tag subscription');
  }
  const data = await res.json();
  return data.subscription;
}

export async function removeTagSubscription(id) {
  const csrf = getCsrfToken();
  const res = await fetch(`${BACKEND_URL}/users/tags/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: csrf ? { 'x-csrf-token': csrf } : {},
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to remove tag subscription');
  }
}

export async function autocompleteTags(query, type = 'colonia') {
  const res = await fetch(`${BACKEND_URL}/tags/autocomplete?q=${encodeURIComponent(query)}&type=${type}`, {
    credentials: 'include',
  });
  if (!res.ok) return { suggestions: [] };
  return res.json();
}
