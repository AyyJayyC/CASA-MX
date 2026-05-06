const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function parseResponse(response, fallbackError) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || fallbackError);
  }
  return payload;
}

export async function getSubscriptionStatus() {
  const response = await fetch(`${BACKEND_URL}/subscriptions/status`, {
    method: 'GET',
    credentials: 'include',
  });

  const payload = await parseResponse(response, 'No se pudo obtener estado de suscripcion');
  return payload.data;
}

export async function createSubscriptionCheckoutSession(priceId) {
  const response = await fetch(`${BACKEND_URL}/subscriptions/checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(priceId ? { priceId } : {}),
  });

  const payload = await parseResponse(response, 'No se pudo iniciar la suscripcion');
  return payload.data;
}

export async function createBillingPortalSession() {
  const response = await fetch(`${BACKEND_URL}/subscriptions/billing-portal`, {
    method: 'POST',
    credentials: 'include',
  });

  const payload = await parseResponse(response, 'No se pudo abrir el portal de facturacion');
  return payload.data;
}
