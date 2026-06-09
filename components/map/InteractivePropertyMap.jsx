"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { useRouter } from "next/navigation";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { getProperties } from "@/lib/api/properties";
import createMarker from "./createMarker";
import mexicanLocations from "@/lib/data/mexican-locations.json";

function pointInCircle(point, center, radiusMeters) {
  const R = 6371000;
  const dLat = ((center.lat - point.lat) * Math.PI) / 180;
  const dLng = ((center.lng - point.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point.lat * Math.PI) / 180) *
      Math.cos((center.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c <= radiusMeters;
}

function pointInRect(point, bounds) {
  return (
    point.lat >= bounds.sw.lat &&
    point.lat <= bounds.ne.lat &&
    point.lng >= bounds.sw.lng &&
    point.lng <= bounds.ne.lng
  );
}

function pointInPolygon(point, polygon) {
  const latlngs = polygon.getLatLngs()[0];
  let inside = false;
  for (let i = 0, j = latlngs.length - 1; i < latlngs.length; j = i++) {
    const xi = latlngs[i].lat;
    const yi = latlngs[i].lng;
    const xj = latlngs[j].lat;
    const yj = latlngs[j].lng;
    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export default function InteractivePropertyMap({
  center = [29.075, -110.955],
  zoom = 13,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const clusterRef = useRef(null);
  const router = useRouter();
  const { track } = useAnalytics();
  const [activeShape, setActiveShape] = useState(null);
  const [matchCount, setMatchCount] = useState(0);
  const [searchUrl, setSearchUrl] = useState("/properties");
  const [selectedColonias, setSelectedColonias] = useState([]);
  const [coloniaSearch, setColoniaSearch] = useState("");
  const [mapLoading, setMapLoading] = useState(true);

  const allColonias = mexicanLocations.estados
    .filter((e) => e.nombre === "Sonora")
    .flatMap((e) => e.ciudades)
    .filter((c) => c.nombre === "Hermosillo")
    .flatMap((c) =>
      (c.colonias || []).map((name) => ({
        name,
        ciudad: c.nombre,
        estado: "Sonora",
      }))
    );

  const filteredColonias = coloniaSearch.trim()
    ? allColonias.filter((c) =>
        c.name.toLowerCase().includes(coloniaSearch.toLowerCase())
      )
    : allColonias;

  const clearShape = useCallback(() => {
    if (activeShape?.layer) {
      mapInstanceRef.current?.removeLayer(activeShape.layer);
    }
    setActiveShape(null);
    setMatchCount(0);
    setSearchUrl("/properties");

    markersRef.current.forEach(({ marker, isInside }) => {
      if (isInside) marker.setOpacity(1);
    });
  }, [activeShape]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, { maxZoom: 19 }).setView(center, zoom);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    if (map.pm && map.pm.addControls) {
      map.pm.addControls({
        position: "topleft",
        drawMarker: true,
        drawPolygon: true,
        drawRectangle: true,
        drawCircle: true,
        drawCircleMarker: false,
        drawPolyline: false,
        cutPolygon: false,
        editMode: false,
        dragMode: false,
        removalMode: true,
        rotateMode: false,
      });
    }

    map.on("pm:create", (e) => {
      if (activeShape?.layer) {
        map.removeLayer(activeShape.layer);
      }

      const layer = e.layer;
      if (e.shape === "Circle") {
        layer.setStyle({ color: "#A05C45", weight: 2.5, opacity: 0.9, fillColor: "#A05C45", fillOpacity: 0.2 });
      } else if (e.shape === "Rectangle" || e.shape === "Polygon") {
        layer.setStyle({ color: "#A05C45", weight: 2.5, opacity: 0.9, fillColor: "#A05C45", fillOpacity: 0.2 });
      }
      let matchCount = 0;

      if (e.shape === "Circle") {
        const circleCenter = layer.getLatLng();
        const circleRadius = layer.getRadius();

        markersRef.current.forEach(({ marker, property }) => {
          const inShape = pointInCircle({ lat: property.lat, lng: property.lng }, circleCenter, circleRadius);
          marker.setOpacity(inShape ? 1 : 0.3);
          markersRef.current.forEach((m) => { if (m.marker === marker) m.isInside = inShape; });
          if (inShape) matchCount++;
        });

        setSearchUrl(
          `/properties?centerLat=${circleCenter.lat.toFixed(6)}&centerLng=${circleCenter.lng.toFixed(6)}&radiusKm=${(circleRadius / 1000).toFixed(1)}`
        );
      } else if (e.shape === "Rectangle") {
        const b = layer.getBounds();
        const bounds = { sw: { lat: b.getSouth(), lng: b.getWest() }, ne: { lat: b.getNorth(), lng: b.getEast() } };

        markersRef.current.forEach(({ marker, property }) => {
          const inShape = pointInRect({ lat: property.lat, lng: property.lng }, bounds);
          marker.setOpacity(inShape ? 1 : 0.3);
          markersRef.current.forEach((m) => { if (m.marker === marker) m.isInside = inShape; });
          if (inShape) matchCount++;
        });

        setSearchUrl(
          `/properties?swLat=${bounds.sw.lat.toFixed(6)}&swLng=${bounds.sw.lng.toFixed(6)}&neLat=${bounds.ne.lat.toFixed(6)}&neLng=${bounds.ne.lng.toFixed(6)}`
        );
      } else if (e.shape === "Polygon") {
        markersRef.current.forEach(({ marker, property }) => {
          const inShape = pointInPolygon({ lat: property.lat, lng: property.lng }, layer);
          marker.setOpacity(inShape ? 1 : 0.3);
          markersRef.current.forEach((m) => { if (m.marker === marker) m.isInside = inShape; });
          if (inShape) matchCount++;
        });

        const b = layer.getBounds();
        setSearchUrl(
          `/properties?swLat=${b.getSouth().toFixed(6)}&swLng=${b.getWest().toFixed(6)}&neLat=${b.getNorth().toFixed(6)}&neLng=${b.getEast().toFixed(6)}`
        );
      } else if (e.shape === "Marker") {
        layer.bindPopup(`
          <div style="min-width:150px">
            <strong>Nuevo marcador</strong><br/>
            <small>Lat: ${layer.getLatLng().lat.toFixed(6)}, Lng: ${layer.getLatLng().lng.toFixed(6)}</small><br/>
            <a href="/upload/sale" style="color:#A05C45">Publicar propiedad aqui →</a>
          </div>
        `);
        layer.on("click", () => layer.openPopup());
      }

      setActiveShape({ layer, type: e.shape });
      setMatchCount(matchCount);

      if (track && e.shape !== "Marker") {
        track("MapAreaSearch", { metadata: { shapeType: e.shape, matchCount } });
      }
    });

    map.on("pm:remove", (e) => {
      if (e.layer === activeShape?.layer) {
        clearShape();
      }
    });

    loadProperties(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  async function loadProperties(map) {
    try {
      const res = await getProperties({ limit: 500, listingType: undefined });
      const properties = res || [];
      setMapLoading(false);

      const cluster = L.featureGroup();
      const markerData = [];

      properties.forEach((p) => {
        if (!p.lat || !p.lng) return;
        const { marker } = createMarker({ L, property: p, track, router });
        cluster.addLayer(marker);
        markerData.push({ marker, property: p });
      });

      markersRef.current = markerData;
      if (mapInstanceRef.current) {
        map.addLayer(cluster);
      }
    } catch (err) {
      console.warn("No se pudieron cargar las propiedades:", err);
      setMapLoading(false);
    }
  }

  const coloniaSearchUrl =
    selectedColonias.length > 0
      ? `/properties?colonia=${selectedColonias.join(",")}&ciudad=Hermosillo&estado=Sonora`
      : "/properties";

  const toggleColonia = useCallback((name) => {
    setSelectedColonias((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);

  return (
    <div>
      <div className="mb-3 flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Usa las herramientas para buscar propiedades en un area
        </span>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <span className="w-3 h-3 rounded-sm border border-neutral-400 bg-neutral-100 inline-block" /> Rectangulo
          <span className="w-3 h-3 rounded-full border border-neutral-400 bg-neutral-100 inline-block ml-1" /> Circulo
          <span className="w-3 h-3 border border-neutral-400 bg-neutral-100 inline-block ml-1 rotate-45" /> Poligono
        </div>
      </div>

      {activeShape && matchCount > 0 && (
        <div className="mb-3 p-3 bg-clay/10 dark:bg-clay-900/20 border border-clay-200 dark:border-clay-800 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-clay dark:text-clay">
            {matchCount} {matchCount === 1 ? "propiedad encontrada" : "propiedades encontradas"} en esta zona
          </span>
          <div className="flex gap-2">
            <a href={searchUrl} className="px-4 py-1.5 bg-clay hover:bg-clay-500 text-white text-xs font-semibold rounded-lg transition-all">
              Ver todas →
            </a>
            <button onClick={clearShape} className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
              Limpiar
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <div className="w-full h-[650px] border rounded overflow-hidden relative">
            {mapLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-neutral-950/80">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="w-5 h-5 border-2 border-clay/30 border-t-clay rounded-full animate-spin" />
                  Cargando propiedades...
                </div>
              </div>
            )}
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} data-testid="property-map" />
          </div>
        </div>

        <div className="lg:w-72 flex-shrink-0">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Colonias ({allColonias.length})
            </h3>
            <input
              type="text"
              value={coloniaSearch}
              onChange={(e) => setColoniaSearch(e.target.value)}
              placeholder="Buscar colonia..."
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-clay mb-2"
            />
            <div className="max-h-[300px] overflow-y-auto space-y-0.5">
              {filteredColonias.map((colonia) => (
                <button
                  key={colonia.name}
                  onClick={() => toggleColonia(colonia.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
                    selectedColonias.includes(colonia.name)
                      ? "bg-clay text-white font-medium"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {colonia.name}
                </button>
              ))}
            </div>
          </div>

          {selectedColonias.length > 0 && (
            <div className="mt-3 bg-clay/5 dark:bg-clay-900/10 border border-clay-200 dark:border-clay-800 rounded-lg p-3">
              <p className="text-xs font-semibold text-clay mb-2">
                {selectedColonias.length} seleccionada{selectedColonias.length !== 1 ? "s" : ""}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedColonias.map((name) => (
                  <span key={name} className="inline-flex items-center gap-1 px-2 py-0.5 bg-clay-100 dark:bg-clay-900/30 text-clay-700 dark:text-clay-300 rounded-full text-xs">
                    {name}
                    <button onClick={() => toggleColonia(name)} className="hover:text-red-500 ml-0.5">×</button>
                  </span>
                ))}
              </div>
              <a href={coloniaSearchUrl} className="block w-full text-center px-3 py-2 bg-clay hover:bg-clay-500 text-white text-xs font-semibold rounded-lg transition-all">
                Buscar propiedades →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
