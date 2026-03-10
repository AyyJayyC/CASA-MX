/**
 * Requests API (mocked, persistent)
 * Purpose: Track buyer requests for property information.
 */

import { getItem, setItem } from '../storage/storage';

/**
 * Simulate latency
 */
function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Add a request (buyer requesting property info)
 * @param {{propertyId, name, phone, buyerId}} payload
 * @returns {Promise<request>}
 */
export async function addRequest(payload) {
  await delay(200);

  let requests = getItem('requests') || [];

  const newRequest = {
    id: `req-${Date.now()}`,
    propertyId: payload.propertyId,
    name: payload.name,
    phone: payload.phone,
    buyerId: payload.buyerId || 'buyer-demo',
    createdAt: new Date().toISOString()
  };

  requests.push(newRequest);
  setItem('requests', requests);

  return newRequest;
}

/**
 * Get requests by buyer
 * @param {string} buyerId
 * @returns {Promise<array>}
 */
export async function getRequestsByBuyer(buyerId) {
  await delay(150);
  const requests = getItem('requests') || [];
  return requests.filter((r) => r.buyerId === buyerId);
}

/**
 * Get all requests (admin)
 * @returns {Promise<array>}
 */
export async function getAllRequests() {
  await delay(150);
  return getItem('requests') || [];
}

/**
 * Delete a request
 * @param {string} requestId
 * @returns {Promise<void>}
 */
export async function deleteRequest(requestId) {
  await delay(200);
  let requests = getItem('requests') || [];
  requests = requests.filter((r) => r.id !== requestId);
  setItem('requests', requests);
}
