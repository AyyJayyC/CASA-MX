/**
 * Negotiations API
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const headers = { 'Content-Type': 'application/json' };
const opts = { credentials: 'include' };

export async function getNegotiationByApplication(applicationId) {
  const res = await fetch(`${BACKEND_URL}/negotiations/by-application/${applicationId}`, opts);
  if (!res.ok) throw new Error('Failed to fetch negotiation');
  return res.json();
}

export async function startNegotiation({ rentalApplicationId, proposedRent, message }) {
  const res = await fetch(`${BACKEND_URL}/negotiations`, {
    method: 'POST',
    headers,
    ...opts,
    body: JSON.stringify({ rentalApplicationId, proposedRent, message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to start negotiation');
  return data;
}

export async function submitCounterOffer(negotiationId, { proposedRent, message }) {
  const res = await fetch(`${BACKEND_URL}/negotiations/${negotiationId}/counter`, {
    method: 'POST',
    headers,
    ...opts,
    body: JSON.stringify({ proposedRent, message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit counter-offer');
  return data;
}

export async function respondToOffer(negotiationId, action) {
  const res = await fetch(`${BACKEND_URL}/negotiations/${negotiationId}/respond`, {
    method: 'POST',
    headers,
    ...opts,
    body: JSON.stringify({ action }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to respond');
  return data;
}
