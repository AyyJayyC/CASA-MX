import {
  apiPost,
  apiGet,
  apiPatch,
  apiDelete,
  apiFetch,
  BACKEND_URL,
} from "./client";

export async function getProperties(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.listingType) queryParams.append("listingType", filters.listingType);
  if (filters.estado) queryParams.append("estado", filters.estado);
  if (filters.ciudad) queryParams.append("ciudad", filters.ciudad);
  if (filters.colonia) queryParams.append("colonia", filters.colonia);
  if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
  if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
  if (filters.minRent) queryParams.append("minRent", filters.minRent);
  if (filters.maxRent) queryParams.append("maxRent", filters.maxRent);
  if (filters.furnished !== undefined) queryParams.append("furnished", filters.furnished);
  if (filters.condition) queryParams.append("condition", filters.condition);
  if (filters.parkingType) queryParams.append("parkingType", filters.parkingType);
  if (filters.petFriendly !== undefined) queryParams.append("petFriendly", filters.petFriendly);
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.minConstructionMeters) queryParams.append("minConstructionMeters", filters.minConstructionMeters);
  if (filters.maxConstructionMeters) queryParams.append("maxConstructionMeters", filters.maxConstructionMeters);
  if (filters.minLotSize) queryParams.append("minLotSize", filters.minLotSize);
  if (filters.maxLotSize) queryParams.append("maxLotSize", filters.maxLotSize);
  if (filters.swLat !== undefined) queryParams.append("swLat", filters.swLat);
  if (filters.swLng !== undefined) queryParams.append("swLng", filters.swLng);
  if (filters.neLat !== undefined) queryParams.append("neLat", filters.neLat);
  if (filters.neLng !== undefined) queryParams.append("neLng", filters.neLng);
  if (filters.centerLat !== undefined) queryParams.append("centerLat", filters.centerLat);
  if (filters.centerLng !== undefined) queryParams.append("centerLng", filters.centerLng);
  if (filters.radiusKm !== undefined) queryParams.append("radiusKm", filters.radiusKm);
  if (filters.limit) queryParams.append("limit", filters.limit);
  if (filters.offset) queryParams.append("offset", filters.offset);

  const qs = queryParams.toString();
  return (await apiGet(`/properties${qs ? `?${qs}` : ""}`)).data || [];
}

export async function getPropertyById(id) {
  try {
    return (await apiGet(`/properties/${id}`)).data || null;
  } catch {
    return null;
  }
}

export async function getMyProperties(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.listingType) queryParams.append("listingType", filters.listingType);
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.visibility) queryParams.append("visibility", filters.visibility);
  if (filters.limit) queryParams.append("limit", filters.limit);
  if (filters.offset) queryParams.append("offset", filters.offset);

  const qs = queryParams.toString();
  return (await apiGet(`/properties/mine${qs ? `?${qs}` : ""}`)).data || [];
}

export async function addProperty(payload) {
  return (await apiPost("/properties", payload)).data;
}

export async function updateProperty(id, updates) {
  return (await apiPatch(`/properties/${id}`, updates)).data;
}

export async function publishProperty(id) {
  return (await apiPost(`/properties/${id}/publish`)).data;
}

export async function promoteProperty(id, tier, days) {
  return apiPost(`/properties/${id}/promote`, { tier, days });
}

export async function deleteProperty(id) {
  await apiDelete(`/properties/${id}`);
  return { success: true };
}

export async function getFilterOptions() {
  try {
    return (await apiGet("/properties/filter-options")).data || {};
  } catch {
    return { estados: [], ciudades: {} };
  }
}

export async function bulkImportProperties(rows, defaultVisibility = "private", onProgress) {
  const results = { created: 0, incomplete: 0, updated: 0, failed: 0, errors: [] };
  let stopped = false;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const payload = { ...row, visibility: row.visibility || defaultVisibility };
      const response = await apiFetch(`/properties?soft=true`, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        results.failed++;
        let detail;
        if (response.status === 429) {
          detail = "L\u00edmite de importaci\u00f3n (100/15min). Se detuvo la importaci\u00f3n.";
          stopped = true;
        } else if (response.status === 402) {
          const error = await response.json().catch(() => null);
          detail = error?.error || "Saldo insuficiente para reactivar (10 cr\u00e9ditos requeridos)";
        } else if (response.status === 401) {
          detail = "Sesi\u00f3n expirada. Refresca la p\u00e1gina y vuelve a intentarlo.";
        } else if (response.status === 500) {
          detail = `Error del servidor al procesar "${row.title || "esta propiedad"}".`;
        } else {
          const error = await response.json().catch(() => null);
          detail = error?.details?.[0]?.message || error?.error || `Error HTTP ${response.status}`;
        }
        results.errors.push({ title: row.title || "Sin t\u00edtulo", error: detail, status: "failed", _row: row });
        if (stopped) break;
      } else {
        const data = await response.json();
        if (data?.duplicateSelf) {
          results.created++;
          results.errors.push({
            title: row.title || "Sin t\u00edtulo",
            error: data?.reactivatedFree
              ? `\u267b\ufe0f Reactivada (gratis \u2014 ${data.daysRemaining || "?"} d\u00edas restantes de captaci\u00f3n)`
              : "\u267b\ufe0f Reactivada (-10 cr\u00e9ditos \u2014 captaci\u00f3n de 180 d\u00edas vencida)",
            status: "reactivated",
            _row: row,
          });
        } else if (data?.isIncomplete || data?.warnings?.length > 0) {
          results.incomplete++;
          results.errors.push({
            title: row.title || "Sin t\u00edtulo",
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
        title: row.title || "Sin t\u00edtulo",
        error: err.message === "Failed to fetch"
          ? "Error de conexi\u00f3n. Verifica tu internet."
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
