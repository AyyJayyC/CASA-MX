import { useState } from "react"
import { useFilterOptions } from "@/lib/queries"
import type { PropertyFilters } from "@/types/property"
import { Button } from "@/components/ui/Button"

interface Props {
  filters: PropertyFilters
  onChange: (f: PropertyFilters) => void
  onClose: () => void
}

const PROPERTY_TYPES = ["Casa", "Departamento", "Terreno", "Local comercial", "Oficina", "Bodega"]
const CONDITIONS = ["Nuevo", "Remodelado", "Buen estado", "A remodelar"]
const AMENITIES = ["Alberca", "Gimnasio", "Elevador", "Aire acondicionado", "Calefacción", "Jardín", "Terraza", "Balcón", "Cuarto de servicio", "Bodega", "Cocina integral", "Estacionamiento", "Portón eléctrico", "Cisterna", "Tanque estacionario"]
const SERVICES = ["Luz", "Agua", "Gas", "Internet", "TV por cable", "Teléfono", "Vigilancia"]
const FINANCING_OPTIONS = ["Efectivo", "Crédito bancario", "INFONAVIT", "FOVISSSTE", "Plan de pagos", "Otro"]

export function PropertyFilter({ filters, onChange, onClose }: Props) {
  const { data: filterOpts } = useFilterOptions()
  const [selectedEstado, setSelectedEstado] = useState(filters.estado ?? "")
  const [selectedCiudad, setSelectedCiudad] = useState(filters.ciudad ?? "")
  const ciudades = selectedEstado && filterOpts?.ciudades ? (filterOpts.ciudades[selectedEstado] ?? []) : []

  function update(f: Partial<PropertyFilters>) {
    onChange({ ...filters, ...f, offset: 0 })
  }

  return (
    <div className="bg-white border border-sand-dark/30 rounded-2xl p-6 space-y-6 h-fit sticky top-20">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Filtros</h2>
        <button onClick={onClose} className="text-ink-muted hover:text-ink lg:hidden">&times;</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Buscar</label>
        <input
          type="text"
          placeholder="Palabras clave..."
          className="w-full rounded-lg border border-sand-dark/30 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
          onChange={(e) => { if (e.target.value) update({ ciudad: e.target.value }); else update({ ciudad: undefined }) }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Tipo de operación</label>
        <div className="flex gap-2">
          <button
            onClick={() => update({ listingType: filters.listingType === "for_sale" ? undefined : "for_sale" })}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filters.listingType === "for_sale" ? "bg-clay text-white" : "bg-sand-light text-ink-light hover:bg-sand"}`}
          >En venta</button>
          <button
            onClick={() => update({ listingType: filters.listingType === "for_rent" ? undefined : "for_rent" })}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filters.listingType === "for_rent" ? "bg-clay text-white" : "bg-sand-light text-ink-light hover:bg-sand"}`}
          >En renta</button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Tipo de propiedad</label>
        <select
          value={filters.propertyType ?? ""}
          onChange={(e) => update({ propertyType: e.target.value || undefined })}
          className="w-full rounded-lg border border-sand-dark/30 bg-white px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
        >
          <option value="">Todos</option>
          {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {filters.listingType === "for_sale" ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Precio mínimo</label>
            <input type="number" placeholder="$0" className="w-full rounded-lg border border-sand-dark/30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
              value={filters.minPrice ?? ""} onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Precio máximo</label>
            <input type="number" placeholder="$1M+" className="w-full rounded-lg border border-sand-dark/30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
              value={filters.maxPrice ?? ""} onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Renta mínima</label>
            <input type="number" placeholder="$0" className="w-full rounded-lg border border-sand-dark/30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
              value={filters.minRent ?? ""} onChange={(e) => update({ minRent: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Renta máxima</label>
            <input type="number" placeholder="$100k+" className="w-full rounded-lg border border-sand-dark/30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
              value={filters.maxRent ?? ""} onChange={(e) => update({ maxRent: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">M\u00B2 mínimo</label>
          <input type="number" placeholder="0" className="w-full rounded-lg border border-sand-dark/30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
            value={filters.minConstructionMeters ?? ""} onChange={(e) => update({ minConstructionMeters: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">M\u00B2 máximo</label>
          <input type="number" placeholder="1000" className="w-full rounded-lg border border-sand-dark/30 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
            value={filters.maxConstructionMeters ?? ""} onChange={(e) => update({ maxConstructionMeters: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Condición</label>
        <select
          value={filters.condition ?? ""}
          onChange={(e) => update({ condition: e.target.value || undefined })}
          className="w-full rounded-lg border border-sand-dark/30 bg-white px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
        >
          <option value="">Cualquiera</option>
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={!!filters.petFriendly} onChange={(e) => update({ petFriendly: e.target.checked || undefined })} className="rounded border-sand-dark/50 text-clay focus:ring-clay" />
          Mascotas permitidas
        </label>
      </div>

      {filterOpts && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Estado</label>
            <select
              value={selectedEstado}
              onChange={(e) => { setSelectedEstado(e.target.value); setSelectedCiudad(""); update({ estado: e.target.value || undefined, ciudad: undefined }) }}
              className="w-full rounded-lg border border-sand-dark/30 bg-white px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
            >
              <option value="">Todos</option>
              {filterOpts.estados.map((e: string) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          {selectedEstado && ciudades.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Ciudad</label>
              <select
                value={selectedCiudad}
                onChange={(e) => { setSelectedCiudad(e.target.value); update({ ciudad: e.target.value || undefined }) }}
                className="w-full rounded-lg border border-sand-dark/30 bg-white px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
              >
                <option value="">Todas</option>
                {ciudades.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 border-t border-sand-dark/20 pt-4">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Amenidades</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {AMENITIES.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm text-ink-light cursor-pointer">
              <input
                type="checkbox"
                checked={filters.amenities?.includes(a) ?? false}
                onChange={(e) => {
                  const current = filters.amenities ?? []
                  update({ amenities: e.target.checked ? [...current, a] : current.filter((x) => x !== a) })
                }}
                className="rounded border-sand-dark/50 text-clay focus:ring-clay"
              />
              <span>{a}</span>
            </label>
          ))}
        </div>
      </div>

      {filters.listingType === "for_rent" && (
        <div className="space-y-2 border-t border-sand-dark/20 pt-4">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Servicios</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {SERVICES.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm text-ink-light cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.includedServices?.includes(s) ?? false}
                  onChange={(e) => {
                    const current = filters.includedServices ?? []
                    update({ includedServices: e.target.checked ? [...current, s] : current.filter((x) => x !== s) })
                  }}
                  className="rounded border-sand-dark/50 text-clay focus:ring-clay"
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {filters.listingType === "for_sale" && (
        <div className="space-y-2 border-t border-sand-dark/20 pt-4">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Financiamiento</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {FINANCING_OPTIONS.map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm text-ink-light cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.financeOptions?.includes(f) ?? false}
                  onChange={(e) => {
                    const current = filters.financeOptions ?? []
                    update({ financeOptions: e.target.checked ? [...current, f] : current.filter((x) => x !== f) })
                  }}
                  className="rounded border-sand-dark/50 text-clay focus:ring-clay"
                />
                <span>{f}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <Button variant="secondary" className="w-full" onClick={() => onChange({ limit: filters.limit ?? 24 })}>
        Limpiar filtros
      </Button>
    </div>
  )
}
