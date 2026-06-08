import { apiPost, apiGet } from "./client";

export async function getBalance() {
  const res = await apiGet("/credits/balance");
  return res;
}

export async function getTransactions() {
  const res = await apiGet("/credits/transactions");
  return res;
}

export async function getPackages() {
  const res = await apiGet("/credits/packages");
  return res;
}

export async function spendCredit(leadId, leadType) {
  const res = await apiPost("/credits/spend", { leadId, leadType });
  return res;
}

export async function createPaymentIntent(packageId) {
  const res = await apiPost("/credits/payment-intent", { packageId });
  return res;
}

export async function fulfillPayment(packageId, paymentIntentId) {
  const res = await apiPost("/credits/fulfill", { packageId, paymentIntentId });
  return res;
}

export async function adminSyncPackages() {
  const res = await apiPost("/credits/admin/sync-packages");
  return res;
}

export async function getInvoice(transactionId) {
  return apiGet(`/credits/invoice/${transactionId}`);
}
