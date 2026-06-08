import { apiPost, apiGet, apiPatch, apiDelete } from "./client";

export async function getBuyers() {
  try {
    const res = await apiGet("/buyers");
    return res.data || [];
  } catch {
    return [];
  }
}

export async function createBuyer(payload) {
  return (await apiPost("/buyers", payload)).data;
}

export async function updateBuyer(id, payload) {
  return (await apiPatch(`/buyers/${id}`, payload)).data;
}

export async function deleteBuyer(id) {
  return (await apiDelete(`/buyers/${id}`)).data;
}
