/**
 * Mock requests store
 * Purpose: Keep track of 'Request More Information' submissions on the frontend only.
 */

/**
 * @typedef {Object} RequestEntry
 * @property {string} id
 * @property {string} propertyId
 * @property {string} name
 * @property {string} phone
 * @property {string} buyerId
 */

export const requestedProperties = [];

/**
 * Simulate sending a request to the seller and storing it for the buyer.
 * @param {{propertyId:string,name:string,phone:string,buyerId?:string}} payload
 * @returns {Promise<RequestEntry>}
 */
export function addRequest(payload) {
  const id = `req-${requestedProperties.length + 1}`;
  const entry = {
    id,
    propertyId: payload.propertyId,
    name: payload.name,
    phone: payload.phone,
    buyerId: payload.buyerId || 'buyer-demo'
  };
  requestedProperties.push(entry);
  // In a real app this would also notify the seller; here we just resolve
  return Promise.resolve(entry);
}

/**
 * Get requests for a given buyer
 * @param {string} buyerId
 */
export function getRequestsByBuyer(buyerId) {
  return Promise.resolve(requestedProperties.filter((r) => r.buyerId === buyerId));
}
