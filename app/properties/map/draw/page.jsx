"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RequireRole } from "@/components/guards/RequireRole.jsx";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";
import { getItem } from "@/lib/storage/storage";

const InteractivePropertyMap = dynamic(
  () => import("@/components/map/InteractivePropertyMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[650px] bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse">
        <div className="text-neutral-500">Cargando mapa interactivo...</div>
      </div>
    ),
  }
);

export default function DrawMapPage() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const props = getItem("properties") || [];
    setProperties(props);
    setIsLoading(false);
  }, []);

  const count = properties.filter((p) => p.lat && p.lng).length;

  if (isLoading) {
    return (
      <RequireRole roles={["client", "owner", "agent", "admin"]}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Mapa Interactivo</h1>
          <div className="p-4 text-center">Cargando...</div>
        </div>
      </RequireRole>
    );
  }

  return (
    <RequireRole roles={["client", "owner", "admin"]}>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Mapa Interactivo
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Coloca marcadores, dibuja zonas de busqueda, y explora
              propiedades
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/properties/map"
              className="px-4 py-2 text-sm font-medium bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              Mapa normal
            </Link>
            <Link
              href="/properties"
              className="px-4 py-2 text-sm font-medium bg-clay hover:bg-clay-500 text-white rounded-lg transition-all"
            >
              Ver listado
            </Link>
          </div>
        </div>

        {count === 0 && (
          <div className="mb-4 p-4 border rounded bg-clay-50 dark:bg-clay-900/20 border-clay-200 dark:border-clay-800">
            <p className="text-sm text-clay-700 dark:text-clay-300">
              No hay propiedades con coordenadas. Agrega coordenadas al
              publicar una propiedad para verlas en el mapa.
            </p>
          </div>
        )}

        <ErrorBoundary>
          <InteractivePropertyMap />
        </ErrorBoundary>
      </div>
    </RequireRole>
  );
}
