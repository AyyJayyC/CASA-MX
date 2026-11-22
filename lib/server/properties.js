import { getProperties } from "@/lib/api/properties";

/**
 * Server-side first page for the listing. Same filters as the client island,
 * cached for 60s. Public data only (no cookies forwarded).
 */
export async function getInitialProperties(filters) {
  return getProperties(
    { ...filters, limit: 12, offset: 0 },
    { next: { revalidate: 60 } },
  );
}
