const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Upload an account-level document (e.g. INE/IFE).
 * @param {File} file
 * @param {'official_id'|'other'} documentType
 * @param {(pct: number) => void} [onProgress]
 * @returns {{ document: { id: string, documentType: string, fileName: string, isVerified: boolean, verifiedAt?: string } }}
 */
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
    xhr.send(formData);
  });
}

/**
 * Fetch all account-level documents for the authenticated user.
 * @returns {Array<{ id, documentType, fileName, fileMimeType, isVerified, verifiedAt, createdAt, viewUrl }>}
 */
export async function getUserDocuments() {
  const res = await fetch(`${BACKEND_URL}/users/documents`, {
    credentials: 'include',
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || 'Could not fetch documents');
  return payload.documents ?? [];
}

/**
 * Delete an account-level document.
 * @param {string} docId
 */
export async function deleteUserDocument(docId) {
  const res = await fetch(`${BACKEND_URL}/users/documents/${docId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok && res.status !== 204) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.error || 'Could not delete document');
  }
}
