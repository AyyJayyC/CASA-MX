import { apiGet, apiDelete } from './client';
import { BACKEND_URL } from './client';
import { getCsrfToken } from './csrf';

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp']);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function validateFile(file) {
  if (!file) return { valid: false, error: 'No file selected.' };
  const ext = (file.name.split('.').pop() ?? '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `File type ".${ext}" not accepted. Allowed: PDF, JPEG, PNG, WebP.` };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { valid: false, error: `File type "${file.type}" not accepted. Allowed: PDF, JPEG, PNG, WebP.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return { valid: false, error: `File is too large (${sizeMB} MB). Maximum: 10 MB.` };
  }
  return { valid: true };
}

export async function uploadUserDocument(file, documentType, onProgress) {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

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
