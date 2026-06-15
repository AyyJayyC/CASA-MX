import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { useMapProperties } from "@/lib/queries"
import { formatPrice } from "@/lib/format"

const MapComponent = dynamic(() => import("@/components/map/MapView").catch(() => ({ default: () => <div className="h-screen bg-sand-light flex items-center justify-center text-ink-muted">Error cargando mapa</div> })), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-sand-light flex items-center justify-center">
      <p className="text-ink-muted">Cargando mapa...</p>
    </div>
  ),
})

export default function MapPage() {
  const { data, isLoading } = useMapProperties()
  const [selected, setSelected] = useState<string | null>(null)

  const selectedProperty = useMemo(
    () => data?.data.find((p) => p.id === selected),
    [data, selected],
  )

  return (
    <Layout>
      <div className="relative h-[calc(100vh-64px)]">
        <MapComponent
          properties={data?.data ?? []}
          selectedId={selected}
          onSelect={setSelected}
        />

        {selectedProperty && (
          <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-white rounded-2xl shadow-xl border border-sand-dark/30 p-4 space-y-3 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-ink text-sm">{selectedProperty.title}</h3>
                <p className="text-xs text-ink-muted">{selectedProperty.address}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-ink-muted hover:text-ink p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-lg font-bold text-clay">
              {selectedProperty.listingType === "for_rent"
                ? `$${selectedProperty.monthlyRent?.toLocaleString()}/mes`
                : formatPrice(selectedProperty.price)}
            </p>
            <a
              href={`/properties/${selectedProperty.id}`}
              className="block text-center bg-clay text-white py-2 rounded-lg text-sm font-medium hover:bg-clay-dark transition-colors"
            >
              Ver propiedad
            </a>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-clay border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </Layout>
  )
}
