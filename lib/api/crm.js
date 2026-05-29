/**
 * CRM API — buyers CRUD
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getBuyers() {
  const res = await fetch(`${BACKEND_URL}/buyers`, { credentials: 'include' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function createBuyer(payload) {
  const res = await fetch(`${BACKEND_URL}/buyers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create buyer');
  return data.data;
}

export async function updateBuyer(id, payload) {
  const res = await fetch(`${BACKEND_URL}/buyers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update buyer');
  return data.data;
}

export async function deleteBuyer(id) {
  const res = await fetch(`${BACKEND_URL}/buyers/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete buyer');
  return data;
}
