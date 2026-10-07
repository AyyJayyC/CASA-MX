import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/api/properties";
import PropertyDetailContent from "@/components/PropertyDetailContent.jsx";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://casa-mx.com";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    return { title: "Propiedad no encontrada | CasaMX" };
  }

  const image = Array.isArray(property.imageUrls)
    ? property.imageUrls[0]
    : undefined;
  const description = property.description?.slice(0, 160) || undefined;

  return {
    title: `${property.title} | CasaMX`,
    description,
    alternates: { canonical: `/properties/${id}` },
    openGraph: {
      title: property.title,
      description,
      images: image ? [image] : undefined,
      type: "website",
    },
  };
}

function buildListingJsonLd(property, id) {
  const offer =
    property.listingType === "for_rent"
      ? property.monthlyRent
        ? {
            "@type": "Offer",
            price: property.monthlyRent,
            priceCurrency: "MXN",
            availability: "https://schema.org/InStock",
          }
        : undefined
      : property.price
        ? {
            "@type": "Offer",
            price: property.price,
            priceCurrency: "MXN",
          }
        : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description || undefined,
    url: `${SITE_URL}/properties/${id}`,
    image: Array.isArray(property.imageUrls)
      ? property.imageUrls.slice(0, 5)
      : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.ciudad || undefined,
      addressRegion: property.estado || undefined,
      postalCode: property.codigoPostal || undefined,
      addressCountry: "MX",
    },
    ...(offer ? { offers: offer } : {}),
  };
}

export default async function PropertyDetail({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);

  // Return a real 404 (HTTP 404 + not-found page) instead of 200.
  if (!property) {
    notFound();
  }

  const jsonLd = buildListingJsonLd(property, id);

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so a crafted description cannot close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PropertyDetailContent property={property} />
    </>
  );
}
