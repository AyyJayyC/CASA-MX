import { apiGet, apiDelete, apiPatch } from "./client";
import { uploadFile } from "./uploadUtils";

export async function uploadPropertyDocument(
  propertyId,
  file,
  documentType,
  onProgress,
) {
  return uploadFile({
    endpoint: `/properties/${propertyId}/documents`,
    file,
    documentType,
    onProgress,
  });
}

export async function getPropertyDocuments(propertyId) {
  const res = await apiGet(`/properties/${propertyId}/documents`);
  return res?.documents ?? [];
}

export async function deletePropertyDocument(propertyId, docId) {
  return apiDelete(`/properties/${propertyId}/documents/${docId}`);
}

export async function getPropertiesPendingVerification() {
  const res = await apiGet("/admin/properties/pending-verification");
  return res?.properties ?? [];
}

export async function adminVerifyProperty(propertyId, status, note) {
  return apiPatch(`/admin/properties/${propertyId}/verify`, { status, note });
}
