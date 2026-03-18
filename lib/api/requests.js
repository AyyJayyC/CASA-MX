/**
 * Requests API (real backend integration)
 * Purpose: Track buyer requests for property information.
 */

const BACKEND_URL = 'http://localhost:3001';

/**
 * Add a request (buyer requesting property info)
 * @param {{propertyId, name, phone, message?}} payload
 * @returns {Promise<request>}
 */
export async function addRequest(payload) {
  const response = await fetch(`${BACKEND_URL}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Debes iniciar sesión para enviar una solicitud');
    }
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
  const response = await fetch(`${BACKEND_URL}/requests`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
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
