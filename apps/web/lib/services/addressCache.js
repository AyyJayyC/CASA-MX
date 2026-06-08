/**
 * Address Cache Service
 * Purpose: Store and retrieve address history from localStorage for quick suggestions
 * Limits to 50 unique addresses to prevent excessive storage
 */

const CACHE_KEY = "casamx_address_history";
const MAX_ADDRESSES = 50;

/**
 * Normalize address object for comparison
 */
function normalizeAddress(address) {
  if (!address) return null;
  return {
    estado: (address.estado || "").trim().toLowerCase(),
    ciudad: (address.ciudad || "").trim().toLowerCase(),
    colonia: (address.colonia || "").trim().toLowerCase(),
    codigoPostal: (address.codigoPostal || "").trim(),
  };
}

/**
 * Get all cached addresses
 * @returns {Array} List of cached address objects
 */
export function getCachedAddresses() {
  if (typeof window === "undefined") return [];

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error("Failed to read address cache:", error);
    return [];
  }
}

/**
 * Add address to cache (deduplicates and limits size)
 * @param {Object} address - { estado, ciudad, colonia, codigoPostal }
 * @returns {Array} Updated cache
 */
export function addAddressToCache(address) {
  if (typeof window === "undefined" || !address) return [];

  try {
    const normalized = normalizeAddress(address);
    let cache = getCachedAddresses();

    // Remove if already exists (avoid duplicates)
    cache = cache.filter((addr) => {
      const normCached = normalizeAddress(addr);
      return !(
        normCached.estado === normalized.estado &&
        normCached.ciudad === normalized.ciudad &&
        normCached.colonia === normalized.colonia
      );
    });

    // Add to beginning (most recent first)
    cache.unshift(address);

    // Limit to MAX_ADDRESSES
    if (cache.length > MAX_ADDRESSES) {
      cache = cache.slice(0, MAX_ADDRESSES);
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    return cache;
  } catch (error) {
    console.error("Failed to save address to cache:", error);
    return [];
  }
}

/**
 * Clear all cached addresses
 */
export function clearAddressCache() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error("Failed to clear address cache:", error);
  }
}

/**
 * Search cached addresses by partial match
 * @param {string} query - Search term
 * @param {string} field - Field to search ('ciudad', 'colonia', etc)
 * @returns {Array} Matching addresses
 */
export function searchAddressCache(query = "", field = "ciudad") {
  if (!query) return getCachedAddresses().slice(0, 10); // Return recent 10

  const normalized = query.toLowerCase().trim();
  const cache = getCachedAddresses();

  return cache
    .filter((addr) => {
      const fieldValue = (addr[field] || "").toLowerCase();
      return fieldValue.includes(normalized);
    })
    .slice(0, 10); // Return top 10 matches
}

/**
 * Get recently used addresses
 * @param {number} limit - Number of recent addresses to return
 * @returns {Array}
 */
export function getRecentAddresses(limit = 5) {
  return getCachedAddresses().slice(0, limit);
}
