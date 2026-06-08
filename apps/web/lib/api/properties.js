/**
 * Properties API (Real Backend Integration)
 * Purpose: CRUD operations on properties via backend API at http://localhost:3001
 * Checkpoint 6+: Full production integration
 */

import { refreshAccessToken } from "./auth";
import { getCsrfToken } from "./csrf";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function csrfHeaders(base = {}) {
  const token = getCsrfToken();
  return token ? { ...base, "x-csrf-token": token } : base;
}

async function fetchWithAuthRetry(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    headers: csrfHeaders(options.headers || {}),
    credentials: "include",
  });

  if (response.status !== 401) {
    return response;
  }

  try {
    const refreshed = await refreshAccessToken();
    if (!refreshed?.success) {
      return response;
    }

    return fetch(url, {
      ...options,
      headers: csrfHeaders(options.headers || {}),
      credentials: "include",
    });
  } catch {
    return response;
  }
}

/**
 * Get all properties with optional filters
 * @param {Object} filters - Filter options (listingType, estado, ciudad, etc.)
 * @returns {Promise<array>}
 */
export async function getProperties(filters = {}) {
  try {
    const queryParams = new URLSearchParams();

    // Add filters to query
    if (filters.listingType)
      queryParams.append("listingType", filters.listingType);
    if (filters.estado) queryParams.append("estado", filters.estado);
    if (filters.ciudad) queryParams.append("ciudad", filters.ciudad);
    if (filters.colonia) queryParams.append("colonia", filters.colonia);
    if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
    if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
    if (filters.minRent) queryParams.append("minRent", filters.minRent);
    if (filters.maxRent) queryParams.append("maxRent", filters.maxRent);
    if (filters.furnished !== undefined)
      queryParams.append("furnished", filters.furnished);
    if (filters.condition) queryParams.append("condition", filters.condition);
    if (filters.parkingType)
      queryParams.append("parkingType", filters.parkingType);
    if (filters.petFriendly !== undefined)
      queryParams.append("petFriendly", filters.petFriendly);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.minConstructionMeters)
      queryParams.append(
        "minConstructionMeters",
        filters.minConstructionMeters,
      );
    if (filters.maxConstructionMeters)
      queryParams.append(
        "maxConstructionMeters",
        filters.maxConstructionMeters,
      );
    if (filters.minLotSize)
      queryParams.append("minLotSize", filters.minLotSize);
    if (filters.maxLotSize)
      queryParams.append("maxLotSize", filters.maxLotSize);
    if (filters.limit) queryParams.append("limit", filters.limit);
    if (filters.offset) queryParams.append("offset", filters.offset);

    const url = `${BACKEND_URL}/properties${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      if (response.status === 500) {
        throw new Error("Server error: Could not fetch properties");
      }
      throw new Error(
        error?.error || error?.message || "Failed to fetch properties",
      );
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Properties API error:", error);
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
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("Property details API error:", error);
    return null;
  }
}

/**
 * Get current user's owned properties
 * @param {Object} filters
 * @returns {Promise<array>}
 */
export async function getMyProperties(filters = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (filters.listingType)
      queryParams.append("listingType", filters.listingType);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.visibility)
      queryParams.append("visibility", filters.visibility);
    if (filters.limit) queryParams.append("limit", filters.limit);
    if (filters.offset) queryParams.append("offset", filters.offset);

    const response = await fetchWithAuthRetry(
      `${BACKEND_URL}/properties/mine${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      const msg = error?.error || "Failed to fetch owned properties";
      const details = error?.details
        ?.map((d) => `${d.path?.join(".") ?? ""}: ${d.message}`)
        .join("; ");
      throw new Error(details ? `${msg} — ${details}` : msg);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Owned properties API error:", error);
    throw error;
  }
}

export async function addProperty(payload) {
  try {
    const response = await fetchWithAuthRetry(`${BACKEND_URL}/properties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      const message = error?.error || "Failed to create property";
      const err = new Error(message);
      err.code = error?.code;
      throw err;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Create property API error:", error);
    throw error;
  }
}

/**
 * Update property (seller/landlord)
 * @param {string} id - Property ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<property>}
 */
export async function updateProperty(id, updates) {
  try {
    const response = await fetchWithAuthRetry(
      `${BACKEND_URL}/properties/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      const message = error?.error || "Failed to update property";
      const err = new Error(message);
      err.code = error?.code;
      throw err;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Update property API error:", error);
    throw error;
  }
}

/**
 * Publish a draft property after eligibility checks (email verified + INE verified)
 * @param {string} id - Property ID
 * @returns {Promise<object>}
 */
export async function publishProperty(id) {
  const response = await fetchWithAuthRetry(
    `${BACKEND_URL}/properties/${id}/publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error || "Failed to publish property";
    const err = new Error(message);
    err.code = payload?.code;
    throw err;
  }

  return payload?.data;
}

/**
 * Promote a property (seller/landlord only, costs credits)
 * @param {string} id - Property ID
 * @param {string} tier - 'featured' or 'carousel'
 * @param {number} days - Duration in days
 * @returns {Promise<object>}
 */
export async function promoteProperty(id, tier, days) {
  const response = await fetchWithAuthRetry(
    `${BACKEND_URL}/properties/${id}/promote`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, days }),
    },
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const err = new Error(payload?.error || "Failed to promote property");
    err.code = payload?.code;
    throw err;
  }

  return payload;
}

/**
 * Delete property (seller/landlord only)
 * @param {string} id - Property ID
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteProperty(id) {
  try {
    const response = await fetchWithAuthRetry(
      `${BACKEND_URL}/properties/${id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete property");
    }

    return { success: true };
  } catch (error) {
    console.error("Delete property API error:", error);
    throw error;
  }
}

/**
 * Get filter options (estados, ciudades, etc.)
 * @returns {Promise<Object>}
 */
export async function getFilterOptions() {
  try {
    const response = await fetch(`${BACKEND_URL}/properties/filter-options`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch filter options");
    }

    const data = await response.json();
    return data.data || {};
  } catch (error) {
    console.error("Filter options API error:", error);
    return { estados: [], ciudades: {} };
  }
}

/**
 * Bulk import properties from Excel data
 * @param {Array<Object>} rows - Array of property objects
 * @param {string} defaultVisibility - 'public' or 'private'
 * @returns {Promise<{created: number, updated: number, failed: number, errors: Array}>}
 */
export async function bulkImportProperties(
  rows,
  defaultVisibility = "private",
  onProgress,
) {
  const results = {
    created: 0,
    incomplete: 0,
    updated: 0,
    failed: 0,
    errors: [],
  };
  let stopped = false;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const payload = {
        ...row,
        visibility: row.visibility || defaultVisibility,
      };
      const response = await fetchWithAuthRetry(
        `${BACKEND_URL}/properties?soft=true`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        results.failed++;
        let detail;
        if (response.status === 429) {
          detail =
            "Límite de importación (100/15min). Se detuvo la importación.";
          stopped = true;
        } else if (response.status === 402) {
          detail =
            error?.error ||
            "Saldo insuficiente para reactivar (10 créditos requeridos)";
        } else if (response.status === 401) {
          detail = "Sesión expirada. Refresca la página y vuelve a intentarlo.";
        } else if (response.status === 500) {
          detail = `Error del servidor al procesar "${row.title || "esta propiedad"}".`;
        } else {
          const error = await response.json().catch(() => null);
          detail =
            error?.details?.[0]?.message ||
            error?.error ||
            `Error HTTP ${response.status}`;
        }
        results.errors.push({
          title: row.title || "Sin título",
          error: detail,
          status: "failed",
          _row: row,
        });
        if (stopped) break;
      } else {
        const data = await response.json();
        if (data?.duplicateSelf) {
          results.created++;
          if (data?.reactivatedFree) {
            results.errors.push({
              title: row.title || "Sin título",
              error: `♻️ Reactivada (gratis — ${data.daysRemaining || "?"} días restantes de captación)`,
              status: "reactivated",
              _row: row,
            });
          } else {
            results.errors.push({
              title: row.title || "Sin título",
              error:
                "♻️ Reactivada (-10 créditos — captación de 180 días vencida)",
              status: "reactivated",
              _row: row,
            });
          }
        } else if (data?.isIncomplete || data?.warnings?.length > 0) {
          results.incomplete++;
          results.errors.push({
            title: row.title || "Sin título",
            error: data.warnings?.join("; ") || "Campos incompletos",
            status: "incomplete",
            _row: row,
          });
        } else {
          results.created++;
        }
      }
    } catch (err) {
      results.failed++;
      results.errors.push({
        title: row.title || "Sin título",
        error:
          err.message === "Failed to fetch"
            ? "Error de conexión. Verifica tu internet."
            : err.message || "Error inesperado",
        status: "failed",
        _row: row,
      });
    }
    if (onProgress) onProgress(results, stopped);
    if (stopped) break;
  }
  return results;
}
