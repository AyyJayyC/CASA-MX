/**
 * Requests API (real backend integration)
 * Purpose: Track buyer requests for property information.
 */

const BACKEND_URL = 'http://localhost:3001';

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken') || localStorage.getItem('token');
}

/**
 * Add a request (buyer requesting property info)
 * @param {{propertyId, name, phone, message?}} payload
 * @returns {Promise<request>}
 */
export async function addRequest(payload) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Debes iniciar sesión para enviar una solicitud');
  }

  const response = await fetch(`${BACKEND_URL}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'No se pudo enviar la solicitud');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get requests by buyer
 * @param {string} buyerId
 * @returns {Promise<array>}
 */
export async function getRequestsByBuyer(buyerId) {
  const token = getAuthToken();
  if (!token) return [];

  const response = await fetch(`${BACKEND_URL}/requests`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Get all requests (admin)
 * @returns {Promise<array>}
 */
export async function getAllRequests() {
  return getRequestsByBuyer('self');
}

/**
 * Delete a request
 * @param {string} requestId
 * @returns {Promise<void>}
 */
export async function deleteRequest(requestId) {
  throw new Error('deleteRequest is not implemented in backend API yet');
}
