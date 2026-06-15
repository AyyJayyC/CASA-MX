import { useEffect, useRef } from "react"
import "maplibre-gl/dist/maplibre-gl.css"
import type { MapProperty } from "@/types/property"

interface MapViewProps {
  properties: MapProperty[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export default function MapView({ properties, selectedId, onSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (!mapRef.current || properties.length === 0) return

    let mounted = true

    async function init() {
      const maplibregl = await import("maplibre-gl")
      if (!mounted || !mapRef.current) return

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
        center: [-102.5528, 23.6345],
        zoom: 5,
      })

      map.addControl(new maplibregl.default.NavigationControl(), "top-right")
      mapInstance.current = map

      const markers = properties.map((p) => {
        const el = document.createElement("div")
        el.className = "w-8 h-8 rounded-full bg-clay border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
        el.textContent = p.listingType === "for_rent" ? "R" : "$"
        el.onclick = () => onSelect(p.id === selectedId ? null : p.id)

        return new maplibregl.default.Marker({ element: el })
          .setLngLat([p.lng, p.lat])
          .addTo(map)
      })

      markersRef.current = markers
    }

    init()

    return () => {
      mounted = false
      mapInstance.current?.remove()
    }
  }, [properties]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapInstance.current || !selectedId) return
    const p = properties.find((p) => p.id === selectedId)
    if (p) {
      mapInstance.current.flyTo({ center: [p.lng, p.lat], zoom: 15 })
    }
  }, [selectedId, properties])

  return <div ref={mapRef} className="w-full h-full" />
}
