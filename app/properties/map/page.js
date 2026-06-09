"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RequireRole } from "@/components/guards/RequireRole.jsx";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";
import { getItem } from "@/lib/storage/storage";

// Dynamic import to avoid SSR issues with Leaflet
const PropertyMap = dynamic(() => import("@/components/map/PropertyMap"), {
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading map...</div>,
});

export default function PropertiesMapPage() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch properties client-side only (avoid SSR localStorage access)
  useEffect(() => {
    const props = getItem("properties") || [];
    setProperties(props);
    setIsLoading(false);
  }, []);

  const count = properties.filter((p) => p.lat && p.lng).length;

  if (isLoading) {
    return (
      <RequireRole roles={["buyer", "seller", "admin"]}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Property Map</h1>
          <div className="p-4 text-center">Loading properties...</div>
        </div>
      </RequireRole>
    );
  }

  return (
    <RequireRole roles={["buyer", "seller", "admin"]}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">Property Map</h1>
          <Link
            href="/properties/map/draw"
            className="px-4 py-2 text-sm font-medium bg-clay hover:bg-clay-500 text-white rounded-lg transition-all"
          >
            Mapa Interactivo →
          </Link>
        </div>
        {count === 0 ? (
          <div className="mb-4 p-4 border rounded bg-clay-50">
            No properties with coordinates found. You can add coordinates in the
            property upload form to show properties on the map.
          </div>
        ) : (
          <p className="mb-4">
            Showing {count} properties with coordinates. Properties without
            coordinates are not shown on the map.
          </p>
        )}

        <ErrorBoundary>
          <PropertyMap />
        </ErrorBoundary>
      </div>
    </RequireRole>
  );
}
