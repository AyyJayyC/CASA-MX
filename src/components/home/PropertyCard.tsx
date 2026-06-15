import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/format"
import type { Property } from "@/types/property"

const TYPE_ICONS: Record<string, string> = {
  Casa: "\uD83C\uDFE1",
  Departamento: "\uD83C\uDFE2",
  Terreno: "\uD83C\uDFD7\uFE0F",
  "Local comercial": "\uD83C\uDFEA",
  Oficina: "\uD83C\uDFE2",
  Bodega: "\uD83C\uDFED",
}

export function PropertyCard({ property }: { property: Property }) {
  const imageUrl = property.imageUrls?.[0]
  const price = property.listingType === "for_rent"
    ? `$${property.monthlyRent?.toLocaleString()}/mes`
    : formatPrice(property.price)
  const typeIcon = TYPE_ICONS[property.propertyType ?? ""] ?? "\uD83C\uDFE1"

  return (
    <Link
      href={`/properties/${property.id}`}
      className="flex-shrink-0 w-64 snap-start group rounded-xl bg-white border border-sand-dark/30 overflow-hidden hover:shadow-md transition-all hover:border-clay/30"
    >
      <div className="relative h-44 bg-sand-light overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            sizes="256px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="h-full flex items-center justify-center text-4xl">
            {typeIcon}
          </div>
        )}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-medium text-ink">
          {property.propertyType ?? "Propiedad"}
        </div>
        {property.promotionTier && (
          <div className="absolute top-2 right-2 bg-clay text-white px-2 py-0.5 rounded-md text-xs font-semibold">
            {property.promotionTier === "carousel" ? "Portada" : "Destacado"}
          </div>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        <p className="text-base font-semibold text-clay">{price}</p>
        <p className="text-sm text-ink line-clamp-1">{property.title}</p>
        <p className="text-xs text-ink-muted line-clamp-1">
          {[property.colonia, property.ciudad, property.estado].filter(Boolean).join(", ")}
        </p>
        <div className="flex items-center gap-3 text-xs text-ink-light pt-1">
          {property.bedrooms != null && <span>{property.bedrooms} \uD83D\uDECF\uFE0F</span>}
          {property.bathrooms != null && <span>{property.bathrooms} \uD83D\uDEBF</span>}
          {property.squareMeters != null && <span>{property.squareMeters}m²</span>}
        </div>
      </div>
    </Link>
  )
}
