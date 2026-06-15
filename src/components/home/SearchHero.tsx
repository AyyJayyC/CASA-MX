import { useState } from "react"
import type { PropertyFilters } from "@/types/property"

interface SearchHeroProps {
  onSearch: (filters: PropertyFilters) => void
  onSearchComplete?: () => void
}

export function SearchHero({ onSearch, onSearchComplete }: SearchHeroProps) {
  const [city, setCity] = useState("")
  const [type, setType] = useState<"for_sale" | "for_rent" | "">("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch({ listingType: type || undefined, ciudad: city || undefined })
    onSearchComplete?.()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mx-auto">
      <input
        type="text"
        placeholder="Ciudad o colonia..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="flex-1 rounded-lg border-0 bg-white/95 px-4 py-3 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-clay text-sm"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as typeof type)}
        className="rounded-lg border-0 bg-white/95 px-4 py-3 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
      >
        <option value="">Tipo de propiedad</option>
        <option value="for_sale">En venta</option>
        <option value="for_rent">En renta</option>
      </select>
      <button
        type="submit"
        className="rounded-lg bg-clay px-6 py-3 text-white font-medium text-sm hover:bg-clay-dark transition-colors"
      >
        Buscar
      </button>
    </form>
  )
}
