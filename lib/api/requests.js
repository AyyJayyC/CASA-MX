import { apiPost, apiGet } from "./client";

export async function addRequest(payload) {
  return (await apiPost("/requests", payload)).data;
}

export async function getMyRequests() {
  try {
    return (await apiGet("/requests")).data || [];
  } catch {
    return [];
  }
}

export async function getSellerRequests() {
  try {
    return (await apiGet("/requests/seller")).data || [];
  } catch {
    return [];
  }
}

export async function approveRequest(requestId) {
  return apiPost(`/requests/${requestId}/approve`);
}
