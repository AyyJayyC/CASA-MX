/**
 * Credits API
 * Purpose: Manage credit balance, packages, spending, and Stripe payments
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getBalance() {
  const res = await fetch(`${BACKEND_URL}/credits/balance`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch credit balance');
  return res.json(); // { success, balance }
}

export async function getTransactions() {
  const res = await fetch(`${BACKEND_URL}/credits/transactions`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json(); // { success, transactions }
}

export async function getPackages() {
  const res = await fetch(`${BACKEND_URL}/credits/packages`);
  if (!res.ok) throw new Error('Failed to fetch packages');
  return res.json(); // { success, packages }
}

/**
 * Spend 1 credit to unlock a lead's contact info (seller/landlord only).
 * @param {string} leadId - RentalApplication or PropertyRequest ID
 * @param {'application'|'request'} leadType
 * @returns {{ success, newBalance, alreadyUnlocked?, contact? }}
 */
export async function spendCredit(leadId, leadType) {
  const res = await fetch(`${BACKEND_URL}/credits/spend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ leadId, leadType }),
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'Insufficient credits'), { status: res.status, data });
  return data;
}

/**
 * Create a Stripe PaymentIntent to purchase a credit package.
 * @param {string} packageId
 * @returns {{ success, clientSecret, amount }}
 */
export async function createPaymentIntent(packageId) {
  const res = await fetch(`${BACKEND_URL}/credits/payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ packageId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create payment');
  return data;
}

/**
 * Fulfill a payment manually (dev/testing only — no Stripe required).
 * @param {string} packageId
 * @param {string} stripePaymentIntentId  - any unique string in dev
 */
export async function fulfillPayment(packageId, stripePaymentIntentId = `dev_${Date.now()}`) {
  const res = await fetch(`${BACKEND_URL}/credits/fulfill`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ packageId, stripePaymentIntentId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fulfill payment');
  return data;
}
