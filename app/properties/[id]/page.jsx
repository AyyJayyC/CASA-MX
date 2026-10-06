import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/api/properties";
import PropertyDetailContent from "@/components/PropertyDetailContent.jsx";

export default async function PropertyDetail({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);

  // Return a real 404 (HTTP 404 + not-found page) instead of 200.
  if (!property) {
    notFound();
  }

  return <PropertyDetailContent property={property} />;
}
