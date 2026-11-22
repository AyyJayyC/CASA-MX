import PropertiesClient from "./PropertiesClient";
import { parsePropertyFilters } from "@/lib/properties/filters";
import { getInitialProperties } from "@/lib/server/properties";

export const revalidate = 60;

export default async function PropertiesPage({ searchParams }) {
  const params = await searchParams;
  const filters = parsePropertyFilters(params);

  let initialData;
  try {
    const properties = await getInitialProperties(filters);
    initialData = { pages: [properties], pageParams: [0] };
  } catch {
    // The client query retries and renders its own error state.
    initialData = undefined;
  }

  return <PropertiesClient initialData={initialData} />;
}
