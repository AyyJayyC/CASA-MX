import { apiPost, apiGet, apiPatch } from "./client";

export async function getMyApplications(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  const qs = params.toString();
  return (await apiGet(`/applications${qs ? `?${qs}` : ""}`)).data;
}

export async function getPropertyApplications(propertyId) {
  return (await apiGet(`/applications/property/${propertyId}`)).data;
}

export async function updateApplicationStatus(applicationId, payload) {
  return (await apiPatch(`/applications/${applicationId}`, payload)).data;
}

export async function submitApplication(payload) {
  return (await apiPost("/applications", payload)).data;
}
