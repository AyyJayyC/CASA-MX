import { useEffect, useRef } from "react"
import type { Property } from "@/types/property"

export function MapPreview({ property }: { property: Property }) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current || !property.lat || !property.lng) return

    let mounted = true

    async function initMap() {
      const maplibregl = await import("maplibre-gl")
      if (!mounted || !mapRef.current || property.lat == null || property.lng == null) return

      const lat = property.lat
      const lng = property.lng

      const map = new maplibregl.default.Map({
        container: mapRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap contributors',
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
        center: [lng, lat],
        zoom: 15,
        interactive: false,
      })

      new maplibregl.default.Marker({ color: "#9A4E37" })
        .setLngLat([lng, lat])
        .addTo(map)
    }

    initMap()
    return () => { mounted = false }
  }, [property.lat, property.lng])

  if (!property.lat || !property.lng) {
    return (
      <div className="h-64 bg-sand-light rounded-xl flex items-center justify-center text-ink-muted text-sm">
        Ubicación no disponible
      </div>
    )
  }

  return <div ref={mapRef} className="h-64 rounded-xl overflow-hidden" />
}
