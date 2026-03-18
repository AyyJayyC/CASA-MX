/**
 * Properties API (Real Backend Integration)
 * Purpose: CRUD operations on properties via backend API at http://localhost:3001
 * Checkpoint 6+: Full production integration
 */

const BACKEND_URL = 'http://localhost:3001';

/**
 * Get all properties with optional filters
 * @param {Object} filters - Filter options (listingType, estado, ciudad, etc.)
 * @returns {Promise<array>}
 */
export async function getProperties(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query
    if (filters.listingType) queryParams.append('listingType', filters.listingType);
    if (filters.estado) queryParams.append('estado', filters.estado);
    if (filters.ciudad) queryParams.append('ciudad', filters.ciudad);
    if (filters.colonia) queryParams.append('colonia', filters.colonia);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    if (filters.minRent) queryParams.append('minRent', filters.minRent);
    if (filters.maxRent) queryParams.append('maxRent', filters.maxRent);
    if (filters.furnished !== undefined) queryParams.append('furnished', filters.furnished);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);

    const url = `${BACKEND_URL}/properties${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 500) {
        throw new Error('Server error: Could not fetch properties');
      }
      throw new Error('Failed to fetch properties');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Properties API error:', error);
    throw error;
  }
}

/**
 * Get property by ID
 * @param {string} id
 * @returns {Promise<property | null>}
 */
export async function getPropertyById(id) {
  try {
    const response = await fetch(`${BACKEND_URL}/properties/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Property details API error:', error);
    return null;
  }
}

/**
 * Create a property (seller/landlord)
 * @param {Object} payload - Property data (title, description, price/monthlyRent, etc.)
 * @param {string} token - JWT token for authentication
 * @returns {Promise<property>}
 */
export async function addProperty(payload, token) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${BACKEND_URL}/properties`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create property');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Create property API error:', error);
    throw error;
  }
}

/**
 * Update property (seller/landlord)
 * @param {string} id - Property ID
 * @param {Object} updates - Fields to update
 * @param {string} token - JWT token for authentication
 * @returns {Promise<property>}
 */
export async function updateProperty(id, updates, token) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${BACKEND_URL}/properties/${id}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update property');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Update property API error:', error);
    throw error;
  }
}

/**
 * Delete property (seller/landlord only)
 * @param {string} id - Property ID
 * @param {string} token - JWT token for authentication
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteProperty(id, token) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${BACKEND_URL}/properties/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete property');
    }

    return { success: true };
  } catch (error) {
    console.error('Delete property API error:', error);
    throw error;
  }
}

/**
 * Get filter options (estados, ciudades, etc.)
 * @returns {Promise<Object>}
 */
export async function getFilterOptions() {
  try {
    const response = await fetch(`${BACKEND_URL}/properties/filters/options`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch filter options');
    }

    const data = await response.json();
    return data.data || {};
  } catch (error) {
    console.error('Filter options API error:', error);
    return { estados: [], ciudades: {} };
  }
}

/**
 * Get centralized Mexico locations catalog
 * @returns {Promise<Object|null>}
 */
export async function getLocationsCatalog() {
  try {
    const response = await fetch(`${BACKEND_URL}/locations`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch locations catalog');
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Locations catalog API error:', error);
    return null;
  }
}
