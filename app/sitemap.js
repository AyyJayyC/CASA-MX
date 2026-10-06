import { getProperties } from "@/lib/api/properties";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://casa-mx.com";

// Regenerate hourly rather than on every request.
export const revalidate = 3600;

const PUBLIC_ROUTES = [
  "",
  "/properties",
  "/properties/map",
  "/publish-property",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/terminos",
  "/aviso-legal",
  "/cookie",
];

export default async function sitemap() {
  const now = new Date();

  const staticEntries = PUBLIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  let listings = [];
  try {
    listings = await getProperties({ limit: 100 });
  } catch {
    // API unavailable at build/regeneration time — ship static routes only.
    listings = [];
  }

  const listingEntries = (Array.isArray(listings) ? listings : [])
    .filter((property) => property?.id)
    .map((property) => ({
      url: `${BASE_URL}/properties/${property.id}`,
      lastModified: property.updatedAt ? new Date(property.updatedAt) : now,
      changeFrequency: "daily",
      priority: 0.8,
    }));

  return [...staticEntries, ...listingEntries];
}
