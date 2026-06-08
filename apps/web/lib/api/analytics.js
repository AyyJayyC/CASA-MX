/**
 * Admin Analytics API
 * Purpose: Centralized admin analytics data fetching.
 * All endpoints require admin role (enforced by backend auth guard).
 *
 * BACKEND ENDPOINTS (to build in casa-mx-backend):
 *   GET /admin/analytics/market-summary?listingType=
 *   GET /admin/analytics/market-by-city?estado=&listingType=
 *   GET /admin/analytics/market-by-colonia?estado=&ciudad=&listingType=
 *   GET /admin/analytics/offer-trends?estado=&ciudad=&colonia=&listingType=&months=12
 *   GET /admin/analytics/offer-analysis?estado=&ciudad=
 *   GET /admin/analytics/opportunities?listingType=
 *   GET /admin/analytics/comps?estado=&ciudad=&colonia=&listingType=&limit=20
 */

import { getCsrfToken } from "./csrf";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function authFetch(url) {
  const token = getCsrfToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["x-csrf-token"] = token;
  try {
    const res = await fetch(url, {
      headers,
      credentials: "include",
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) return null;
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    if (err.message?.startsWith("HTTP ")) throw err;
    return null;
  }
}

/**
 * Global market KPIs with month-over-month deltas.
 * Returns: { activeListings, medianOfferPerSqm, momChange, medianDaysToOffer,
 *            avgOffersPerProperty, acceptanceRate, staleCount, saleVsRent }
 */
export async function getMarketSummary(listingType = "for_sale") {
  const qs = listingType ? `?listingType=${listingType}` : "";
  return authFetch(`${BACKEND_URL}/admin/analytics/market-summary${qs}`);
}

/**
 * Per-city market metrics.
 * Returns: [{ ciudad, activeListings, medianOfferPerSqm, momChange,
 *            medianDaysToOffer, avgOffersPerProperty, acceptanceRate,
 *            staleCount, activityScore }]
 */
export async function getMarketByCity(estado, listingType = "for_sale") {
  const params = new URLSearchParams();
  if (estado) params.set("estado", estado);
  if (listingType) params.set("listingType", listingType);
  return authFetch(
    `${BACKEND_URL}/admin/analytics/market-by-city?${params.toString()}`,
  );
}

/**
 * Per-colonia drilldown for a specific city.
 * Returns: [{ colonia, activeListings, medianOfferPerSqm, medianDaysToOffer,
 *            avgOffersPerProperty, totalOffers, acceptanceRate, staleCount,
 *            momChange, compCount }]
 */
export async function getMarketByColonia(
  estado,
  ciudad,
  listingType = "for_sale",
) {
  const params = new URLSearchParams();
  if (estado) params.set("estado", estado);
  if (ciudad) params.set("ciudad", ciudad);
  if (listingType) params.set("listingType", listingType);
  return authFetch(
    `${BACKEND_URL}/admin/analytics/market-by-colonia?${params.toString()}`,
  );
}

/**
 * Monthly offer value per m² over time for trend charts.
 * Returns: { colonia / ciudad, dates: string[], values: number[] }
 */
export async function getOfferTrends(
  estado,
  ciudad,
  colonia,
  listingType = "for_sale",
  months = 12,
) {
  const params = new URLSearchParams();
  if (estado) params.set("estado", estado);
  if (ciudad) params.set("ciudad", ciudad);
  if (colonia) params.set("colonia", colonia);
  if (listingType) params.set("listingType", listingType);
  params.set("months", String(months));
  return authFetch(
    `${BACKEND_URL}/admin/analytics/offer-trends?${params.toString()}`,
  );
}

/**
 * Computed actionable alerts for admins.
 * Returns: { highDemandLowSupply: [{ colonia, ciudad, score }],
 *            underpricedOffers: [{ colonia, ciudad, avgDiscount }],
 *            staleProperties: [{ propertyId, title, colonia, daysSinceListed }],
 *            trendingUp: [{ colonia, ciudad, momChange }],
 *            trendingDown: [{ colonia, ciudad, momChange }] }
 */
export async function getOpportunities(listingType = "for_sale") {
  const qs = listingType ? `?listingType=${listingType}` : "";
  return authFetch(`${BACKEND_URL}/admin/analytics/opportunities${qs}`);
}

/**
 * Recent comparable accepted/rejected offers in an area.
 * Returns: [{ propertyTitle, propertyType, colonia, offerAmount,
 *            status, offeredAt, m2, pricePerSqm }]
 */
export async function getComps(
  estado,
  ciudad,
  colonia,
  listingType = "for_sale",
  limit = 20,
) {
  const params = new URLSearchParams();
  if (estado) params.set("estado", estado);
  if (ciudad) params.set("ciudad", ciudad);
  if (colonia) params.set("colonia", colonia);
  if (listingType) params.set("listingType", listingType);
  params.set("limit", String(limit));
  return authFetch(`${BACKEND_URL}/admin/analytics/comps?${params.toString()}`);
}
