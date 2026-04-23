const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Upload an ownership verification document for a property.
 * @param {string} propertyId
 * @param {File} file
 * @param {'title_deed'|'official_id'|'agent_authorization'|'other'} documentType
 * @param {(pct: number) => void} [onProgress]
 * @returns {{ document?: { id: string, documentType: string, fileName: string }, autoVerified: boolean, verificationStatus: string, uploadedTypes: string[], missingTypes: string[] }}
 */
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
    xhr.send(formData);
  });
}

/**
 * Fetch all documents for a property (seller / admin only).
 * Returns array of { id, documentType, fileName, presignedUrl, createdAt }
 */
export async function getPropertyDocuments(propertyId) {
  const res = await fetch(`${BACKEND_URL}/properties/${propertyId}/documents`, {
    credentials: 'include',
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || 'Could not fetch documents');
  return payload.documents ?? [];
}

/**
 * Delete a property document (seller only, before verification).
 */
export async function deletePropertyDocument(propertyId, docId) {
  const res = await fetch(`${BACKEND_URL}/properties/${propertyId}/documents/${docId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || 'Could not delete document');
  return payload;
}

/**
 * Admin: list all properties pending verification (docs_uploaded or unverified with docs).
 */
export async function getPropertiesPendingVerification() {
  const res = await fetch(`${BACKEND_URL}/admin/properties/pending-verification`, {
    credentials: 'include',
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || 'Could not fetch pending properties');
  return payload.properties ?? [];
}

/**
 * Admin: approve or reject a property's verification.
 * @param {string} propertyId
 * @param {'verified'|'rejected'} status
 * @param {string} [note]
 */
export async function adminVerifyProperty(propertyId, status, note) {
  const res = await fetch(`${BACKEND_URL}/admin/properties/${propertyId}/verify`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note }),
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || 'Could not update verification');
  return payload;
}
