import { apiGet, apiDelete, apiPatch } from './client';
import { BACKEND_URL } from './client';
import { getCsrfToken } from './csrf';

export async function uploadPropertyDocument(propertyId, file, documentType, onProgress) {
  const formData = new FormData();
  formData.append('documentType', documentType);
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      let parsed;
      try { parsed = JSON.parse(xhr.responseText); } catch { parsed = {}; }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(parsed);
      } else {
        reject(Object.assign(new Error(parsed?.error || 'Upload failed'), { status: xhr.status }));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));

    xhr.open('POST', `${BACKEND_URL}/properties/${propertyId}/documents`);
    const csrf = getCsrfToken();
    if (csrf) xhr.setRequestHeader('x-csrf-token', csrf);
    xhr.send(formData);
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
  const res = await apiGet('/admin/properties/pending-verification');
  return res?.properties ?? [];
}

export async function adminVerifyProperty(propertyId, status, note) {
  return apiPatch(`/admin/properties/${propertyId}/verify`, { status, note });
}
