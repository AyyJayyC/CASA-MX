import type { Property } from "@/types/property"

export function PropertyDescription({ property }: { property: Property }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink mb-3">Descripción</h2>
        <p className="text-ink-light leading-relaxed whitespace-pre-line">
          {property.description || "Sin descripción."}
        </p>
      </div>

      {property.amenities && property.amenities.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-ink mb-2">Amenidades</h3>
          <div className="flex flex-wrap gap-1.5">
            {property.amenities.map((a) => (
              <span key={a} className="px-3 py-1 bg-sand-light rounded-full text-xs text-ink-light">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {property.includedServices && property.includedServices.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-ink mb-2">Servicios incluidos</h3>
          <div className="flex flex-wrap gap-1.5">
            {property.includedServices.map((s) => (
              <span key={s} className="px-3 py-1 bg-sand-light rounded-full text-xs text-ink-light">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {property.maintenanceFee != null && (
        <div>
          <h3 className="text-sm font-semibold text-ink">Mantenimiento</h3>
          <p className="text-ink-light">${property.maintenanceFee.toLocaleString()} MXN/mes</p>
        </div>
      )}

      {property.financeOptions && property.financeOptions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-ink mb-2">Opciones de financiamiento</h3>
          <div className="flex flex-wrap gap-1.5">
            {property.financeOptions.map((f) => (
              <span key={f} className="px-3 py-1 bg-sand-light rounded-full text-xs text-ink-light">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
