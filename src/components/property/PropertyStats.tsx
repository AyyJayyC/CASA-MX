import type { Property } from "@/types/property"

interface StatProps {
  icon: string
  label: string
  value: string | number
}

function Stat({ icon, label, value }: StatProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-sand-light/50 rounded-lg">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  )
}

function maybe(icon: string, label: string, value: string | number | undefined | null): StatProps | null {
  if (value == null || value === "") return null
  return { icon, label, value }
}

export function PropertyStats({ property }: { property: Property }) {
  const stats: Array<StatProps | null> = [
    maybe("\uD83D\uDECF\uFE0F", "Recámaras", property.bedrooms),
    maybe("\uD83D\uDEBF", "Baños", property.bathrooms),
    maybe("\uD83D\uDEBD", "Medio baño", property.halfBaths),
    maybe("\uD83D\uDCCF", "Construcción", property.squareMeters ? `${property.squareMeters}m²` : null),
    maybe("\uD83C\uDFD7\uFE0F", "Terreno", property.lotSize ? `${property.lotSize}m²` : null),
    maybe("\uD83C\uDFE2", "Pisos", property.floors),
    maybe("\uD83D\uDE97", "Estacionamiento", property.parkingSpaces),
    maybe("\uD83D\uDCC5", "Año", property.yearBuilt),
    maybe("\uD83D\uDECB\uFE0F", "Amueblado", property.furnished
      ? { unfurnished: "No", semi_furnished: "Semi", furnished: "Sí", equipada: "Equipada" }[property.furnished]
      : null),
    property.petFriendly ? { icon: "\uD83D\uDC36", label: "Mascotas", value: "Sí" } : null,
    maybe("\uD83D\uDEE0\uFE0F", "Estado", property.condition),
  ]
  const filtered = stats.filter((s): s is StatProps => s !== null)

  if (filtered.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3">
      {filtered.map((s) => (
        <Stat key={s.label} {...s} />
      ))}
    </div>
  )
}
