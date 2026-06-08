"use client";
import React, { useRef, useEffect, useCallback } from "react";
import PropertyCard from "./PropertyCard.jsx";

function PropertyCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm h-full flex flex-col animate-pulse">
      <div className="aspect-video bg-neutral-200 dark:bg-neutral-800" />
      <div className="p-5 flex-1 flex flex-col">
        <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded mb-2 w-3/4" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded mb-3 w-1/2" />
        <div className="space-y-2 mb-4 flex-1">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6" />
        </div>
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-20" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasQuery }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <svg className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {hasQuery ? "No se encontraron propiedades" : "No hay propiedades disponibles"}
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-md">
        {hasQuery ? "Intenta buscar con otros términos o revisa tu búsqueda." : "Aún no hay propiedades publicadas. Vuelve pronto para ver nuevas opciones."}
      </p>
    </div>
  );
}

export default function PropertyList({
  properties = [],
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  searchQuery = "",
  listingType = "for_sale",
  showPrivate = false,
}) {
  const loaderRef = useRef(null);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const ref = loaderRef.current;
    if (!ref) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(ref);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="space-y-6">
      {!isLoading && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {properties.length} {properties.length === 1 ? "propiedad encontrada" : "propiedades encontradas"}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading &&
          [...Array(6)].map((_, i) => <PropertyCardSkeleton key={i} />)}

        {!isLoading &&
          properties.length > 0 &&
          properties.map((p) => <PropertyCard key={p.id} property={p} />)}

        {!isLoading && properties.length === 0 && (
          <EmptyState hasQuery={searchQuery.trim().length > 0} />
        )}

        {isFetchingNextPage &&
          [...Array(3)].map((_, i) => <PropertyCardSkeleton key={`loading-${i}`} />)}
      </div>

      <div ref={loaderRef} className="h-4" />
    </div>
  );
}
