/**
 * Storage Abstraction Layer
 * Purpose: Single point for all persistent storage (localStorage).
 * This layer is backend-replaceable: swap localStorage → API calls without changing consumers.
 */

const STORAGE_VERSION = '1.0.0';
const KEY_PREFIX = 'casa-mx';

/**
 * Generate versioned key
 * @param {string} entity - e.g., 'session', 'users', 'properties'
 * @returns {string}
 */
function getVersionedKey(entity) {
  return `${KEY_PREFIX}:${STORAGE_VERSION}:${entity}`;
}

/**
 * Get item from storage
 * @param {string} entity
 * @returns {any} Parsed JSON or null
 */
export function getItem(entity) {
  try {
    const key = getVersionedKey(entity);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error(`[storage] Error reading ${entity}:`, err);
    return null;
  }
}

/**
 * Set item in storage
 * @param {string} entity
 * @param {any} data
 */
export function setItem(entity, data) {
  try {
    const key = getVersionedKey(entity);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`[storage] Error writing ${entity}:`, err);
  }
}

/**
 * Remove item from storage
 * @param {string} entity
 */
export function removeItem(entity) {
  try {
    const key = getVersionedKey(entity);
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`[storage] Error removing ${entity}:`, err);
  }
}

/**
 * Clear all CASA MX storage (for testing/logout)
 */
export function clear() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (err) {
    console.error('[storage] Error clearing storage:', err);
  }
}
