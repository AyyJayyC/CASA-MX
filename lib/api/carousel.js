import { BACKEND_URL } from "./client";

export async function getCarouselSlides() {
  const res = await fetch(`${BACKEND_URL}/carousel`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch carousel slides");
  const data = await res.json();
  return data.slides || [];
}

export async function getMostViewedProperties(limit = 6) {
  const res = await fetch(
    `${BACKEND_URL}/properties/most-viewed?limit=${limit}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to fetch most viewed properties");
  const data = await res.json();
  return data.properties || [];
}
