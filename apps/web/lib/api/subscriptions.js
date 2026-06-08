import { apiPost, apiGet } from "./client";

export async function createSubscriptionCheckoutSession(priceId) {
  return (
    await apiPost("/subscriptions/checkout-session", priceId ? { priceId } : {})
  ).data;
}

export async function getSubscriptionStatus() {
  return (await apiGet("/subscriptions/status")).data;
}

export async function createBillingPortalSession() {
  return (await apiPost("/subscriptions/billing-portal")).data;
}
