import { PropertyCard } from "./PropertyCard"
import type { Property } from "@/types/property"

interface PropertyCarouselProps {
  title: string
  properties: Property[]
  loading?: boolean
  emptyMessage?: string
}

export function PropertyCarousel({ title, properties, loading, emptyMessage = "No se encontraron propiedades" }: PropertyCarouselProps) {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-semibold text-ink mb-4">{title}</h2>

        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-64 rounded-xl bg-white border border-sand-dark/30 overflow-hidden animate-pulse">
                <div className="h-44 bg-sand-light" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-sand-light rounded w-1/2" />
                  <div className="h-3 bg-sand-light/70 rounded w-3/4" />
                  <div className="h-3 bg-sand-light/50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="bg-sand-light/50 rounded-xl border border-dashed border-sand-dark/50 py-12 text-center text-ink-muted text-sm">
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  )
}
