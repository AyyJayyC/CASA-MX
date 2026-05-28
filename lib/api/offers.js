import { getCsrfToken } from './csrf';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function csrfHeaders(base = {}) {
  const token = getCsrfToken();
  return token ? { ...base, 'x-csrf-token': token } : base;
}

async function parseResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.details?.[0]?.message;
    const err = new Error(detail || payload?.error || fallbackMessage);
    err.code = payload?.code;
    throw err;
  }
  return payload?.data;
}

/**
 * Submit a purchase offer on a sale property (buyer action).
 */
export async function submitPropertyOffer(propertyId, payload) {
  const response = await fetch(`${BACKEND_URL}/properties/${propertyId}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseResponse(response, 'No se pudo enviar la oferta');
}

/**
 * Get all offers on a specific property (seller action).
 */
export async function getPropertyOffers(propertyId) {
  const response = await fetch(`${BACKEND_URL}/properties/${propertyId}/offers`, {
    credentials: 'include',
  });
  return parseResponse(response, 'No se pudieron cargar las ofertas');
}

/**
 * Get all offers across all seller's properties.
 */
export async function getMySellerOffers() {
  const response = await fetch(`${BACKEND_URL}/offers/seller`, {
    credentials: 'include',
  });
  return parseResponse(response, 'No se pudieron cargar las ofertas');
}

/**
 * Get all offers submitted by the logged-in buyer.
 */
export async function getMyBuyerOffers() {
  const response = await fetch(`${BACKEND_URL}/offers/mine`, {
    credentials: 'include',
  });
  return parseResponse(response, 'No se pudieron cargar tus ofertas');
}

/**
 * Seller responds to an offer: accept, reject, or counter.
 */
export async function respondToOffer(offerId, payload) {
  const response = await fetch(`${BACKEND_URL}/offers/${offerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      status: payload.status,
      sellerNote: payload.sellerNote || payload.message || undefined,
      counterAmount: payload.counterAmount ? parseFloat(payload.counterAmount) : undefined,
      proposedFurnishedStatus: payload.proposedFurnishedStatus || undefined,
    }),
  });
  return parseResponse(response, 'No se pudo actualizar la oferta');
}
