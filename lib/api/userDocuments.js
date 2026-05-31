import { apiGet, apiDelete } from './client';
import { BACKEND_URL } from './client';
import { getCsrfToken } from './csrf';

export async function uploadUserDocument(file, documentType, onProgress) {
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

    xhr.open('POST', `${BACKEND_URL}/users/documents`);
    const csrf = getCsrfToken();
    if (csrf) xhr.setRequestHeader('x-csrf-token', csrf);
    xhr.send(formData);
  });
}

export async function getUserDocuments() {
  const res = await apiGet('/users/documents');
  return res?.documents ?? [];
}

export async function deleteUserDocument(docId) {
  try {
    await apiDelete(`/users/documents/${docId}`);
  } catch (err) {
    if (err.status !== 204) throw err;
  }
}
