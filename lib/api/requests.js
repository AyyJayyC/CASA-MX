/**
 * Requests API
 * Purpose: Buyer contact requests for property address reveal (seller-gated).
 */

import { getCsrfToken } from './csrf';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function csrfHeaders(base = {}) {
  const token = getCsrfToken();
  return token ? { ...base, 'x-csrf-token': token } : base;
}

function parseResponse(res, data) {
  if (!res.ok) {
    const msg = data?.error || data?.message || 'Error de red';
    throw Object.assign(new Error(msg), { status: res.status, data });
  }
  return data;
}

/**
 * Submit a contact request (buyer requests property address)
 */
export async function addRequest(payload) {
  const res = await fetch(`${BACKEND_URL}/requests`, {
    method: 'POST',
    headers: csrfHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return parseResponse(res, data).data;
}

/**
 * Get buyer's own requests
 */
export async function getMyRequests() {
  const res = await fetch(`${BACKEND_URL}/requests`, {
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) return [];
  return data.data || [];
}

/**
 * Get seller's received requests (all properties)
 */
export async function getSellerRequests() {
  const res = await fetch(`${BACKEND_URL}/requests/seller`, {
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) return [];
  return data.data || [];
}

/**
 * Approve a request — reveals address to buyer
 */
export async function approveRequest(requestId) {
  const res = await fetch(`${BACKEND_URL}/requests/${requestId}/approve`, {
    method: 'POST',
    headers: csrfHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
  });
  const data = await res.json();
  return parseResponse(res, data);
}

