import { apiGet } from "./client";

export async function getReferredLeads() {
  try {
    const res = await apiGet("/leads/referred");
    return res?.data || { offers: [], requests: [] };
  } catch {
    return { offers: [], requests: [] };
  }
}
