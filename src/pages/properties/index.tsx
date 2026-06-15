import { useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { PropertyFilter } from "@/components/property/PropertyFilters"
import { PropertyGrid } from "@/components/property/PropertyGrid"
import { useProperties } from "@/lib/queries"
import type { PropertyFilters as PF } from "@/types/property"

export default function PropertyListingPage() {
  const [filters, setFilters] = useState<PF>({ limit: 24 })
  const [showFilters, setShowFilters] = useState(false)

  const { data } = useProperties(filters)
  const properties = data?.data ?? []
  const total = data?.total ?? 0

  function loadMore() {
    setFilters((f) => ({ ...f, offset: (f.offset ?? 0) + (f.limit ?? 24) }))
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-ink">
            {filters.listingType === "for_rent" ? "Propiedades en renta" : filters.listingType === "for_sale" ? "Propiedades en venta" : "Propiedades"}
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden px-4 py-2 text-sm font-medium text-clay bg-clay/10 rounded-lg hover:bg-clay/20 transition-colors"
          >
            {showFilters ? "Ocultar filtros" : "Filtros"}
          </button>
        </div>

        <div className="flex gap-8">
          <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-72 flex-shrink-0`}>
            <PropertyFilter
              filters={filters}
              onChange={setFilters}
              onClose={() => setShowFilters(false)}
            />
          </aside>

          <main className="flex-1 min-w-0">
            <PropertyGrid
              properties={properties}
              total={total}
              loading={false}
              filters={filters}
              onLoadMore={loadMore}
            />
          </main>
        </div>
      </div>
    </Layout>
  )
}
