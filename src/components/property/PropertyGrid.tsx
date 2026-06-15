import { PropertyCard } from "@/components/home/PropertyCard"
import { Button } from "@/components/ui/Button"
import type { Property, PropertyFilters } from "@/types/property"

interface Props {
  properties: Property[]
  total: number
  loading: boolean
  filters: PropertyFilters
  onLoadMore: () => void
}

export function PropertyGrid({ properties, total, loading, filters, onLoadMore }: Props) {
  const hasMore = properties.length < total

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ink-muted">
          {loading ? "Cargando..." : `${total} propiedad${total !== 1 ? "es" : ""} encontrada${total !== 1 ? "s" : ""}`}
        </p>
        <p className="text-sm text-ink-muted">
          Mostrando {properties.length} de {total}
        </p>
      </div>

      {loading && properties.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white border border-sand-dark/30 overflow-hidden animate-pulse">
              <div className="h-48 bg-sand-light" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-sand-light rounded w-1/2" />
                <div className="h-3 bg-sand-light/70 rounded w-3/4" />
                <div className="h-5 bg-clay/20 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white border border-sand-dark/30 rounded-xl p-12 text-center">
          <p className="text-5xl mb-4">\uD83D\uDD0D</p>
          <h2 className="text-xl font-semibold text-ink mb-1">Sin resultados</h2>
          <p className="text-ink-muted text-sm">Intenta ajustar los filtros para ver más propiedades.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((p) => (
            <div key={p.id} className="w-full">
              <PropertyCard property={p} />
            </div>
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div className="mt-6 text-center">
          <Button variant="secondary" onClick={onLoadMore}>
            Cargar más propiedades
          </Button>
        </div>
      )}
    </div>
  )
}
