import { apiPost, apiGet, apiPatch } from "./client";

export async function submitPropertyOffer(propertyId, payload) {
  return (await apiPost(`/properties/${propertyId}/offers`, payload)).data;
}

export async function getPropertyOffers(propertyId) {
  return (await apiGet(`/properties/${propertyId}/offers`)).data;
}

export async function getMySellerOffers() {
  return (await apiGet("/offers/seller")).data;
}

export async function getMyBuyerOffers() {
  return (await apiGet("/offers/mine")).data;
}

export async function respondToOffer(offerId, payload) {
  return (await apiPatch(`/offers/${offerId}`, payload)).data;
}
