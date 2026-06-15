import Image from "next/image"
import type { Property } from "@/types/property"

export function FullBleedHero({ property }: { property: Property }) {
  const imageUrl = property.imageUrls?.[0]

  return (
    <div className="relative w-full h-[50vh] min-h-[350px] max-h-[550px] bg-clay-dark overflow-hidden">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={property.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
          unoptimized
        />
      ) : (
        <div className="h-full flex items-center justify-center text-6xl opacity-30">\uD83C\uDFE1</div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <span className="inline-block bg-clay text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
            {property.listingType === "for_sale" ? "En venta" : "En renta"}
            {property.promotionTier && ` · ${property.promotionTier === "carousel" ? "Portada" : "Destacado"}`}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{property.title}</h1>
          <p className="text-white/80">
            {[property.colonia, property.ciudad, property.estado].filter(Boolean).join(", ")}
          </p>
        </div>
      </div>
    </div>
  )
}
