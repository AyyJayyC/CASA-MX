/**
 * Single source of truth for mapping URL search params to backend filters.
 * Used by the server-rendered listing and by the client filter UI.
 */

function value(params, key) {
  if (!params) return "";
  if (typeof params.get === "function") return params.get(key) || "";
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] || "" : raw || "";
}

function num(params, key) {
  const raw = value(params, key);
  if (!raw) return undefined;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parsePropertyFilters(params) {
  const minRent = value(params, "minRent") || "5000";
  const maxRent = value(params, "maxRent") || "50000";

  return {
    listingType: value(params, "type") || "for_sale",
    searchQuery: value(params, "q") || undefined,
    estado: value(params, "estado") || undefined,
    ciudad: value(params, "ciudad") || undefined,
    colonia: value(params, "colonia") || undefined,
    codigoPostal: value(params, "cp") || undefined,
    minPrice: value(params, "minPrice") || undefined,
    maxPrice: value(params, "maxPrice") || undefined,
    minRent: minRent !== "5000" ? minRent : undefined,
    maxRent: maxRent !== "50000" ? maxRent : undefined,
    furnished: value(params, "furnished") ? true : undefined,
    condition: value(params, "condition") || undefined,
    status: value(params, "status") || undefined,
    minConstructionMeters: value(params, "minM2") || undefined,
    maxConstructionMeters: value(params, "maxM2") || undefined,
    minLotSize: value(params, "minLot") || undefined,
    maxLotSize: value(params, "maxLot") || undefined,
    amenities: value(params, "amenities") || undefined,
    services: value(params, "services") || undefined,
    financing: value(params, "financing") || undefined,
    swLat: num(params, "swLat"),
    swLng: num(params, "swLng"),
    neLat: num(params, "neLat"),
    neLng: num(params, "neLng"),
    centerLat: num(params, "centerLat"),
    centerLng: num(params, "centerLng"),
    radiusKm: num(params, "radiusKm"),
  };
}
