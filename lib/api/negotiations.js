const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function parseResponse(res, data, defaultError = 'Error de red') {
  if (!res.ok) {
    throw Object.assign(new Error(data?.error || data?.message || defaultError), { status: res.status, data });
  }
  return data;
}

export async function getNegotiationByApplication(applicationId) {
  const res = await fetch(`${BACKEND_URL}/negotiations/by-application/${applicationId}`, { credentials: 'include' });
  const data = await res.json();
  return parseResponse(res, data, 'Failed to fetch negotiation');
}

export async function startNegotiation({ rentalApplicationId, proposedRent, message }) {
  const res = await fetch(`${BACKEND_URL}/negotiations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ rentalApplicationId, proposedRent, message }),
  });
  const data = await res.json();
  return parseResponse(res, data, 'Failed to start negotiation');
}

export async function submitCounterOffer(negotiationId, { proposedRent, message }) {
  const res = await fetch(`${BACKEND_URL}/negotiations/${negotiationId}/counter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ proposedRent, message }),
  });
  const data = await res.json();
  return parseResponse(res, data, 'Failed to submit counter-offer');
}

export async function respondToOffer(negotiationId, action) {
  const res = await fetch(`${BACKEND_URL}/negotiations/${negotiationId}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action }),
  });
  const data = await res.json();
  return parseResponse(res, data, 'Failed to respond');
}
