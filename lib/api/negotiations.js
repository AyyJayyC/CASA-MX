import { apiPost, apiGet } from './client';

export async function getNegotiationByApplication(applicationId) {
  return apiGet(`/negotiations/by-application/${applicationId}`);
}

export async function startNegotiation({ rentalApplicationId, proposedRent, message }) {
  return apiPost('/negotiations', { rentalApplicationId, proposedRent, message });
}

export async function submitCounterOffer(negotiationId, { proposedRent, message }) {
  return apiPost(`/negotiations/${negotiationId}/counter`, { proposedRent, message });
}

export async function respondToOffer(negotiationId, action) {
  return apiPost(`/negotiations/${negotiationId}/respond`, { action });
}
