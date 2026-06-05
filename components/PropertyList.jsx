/**
 * PropertyList component (client)
 * Purpose: Display a list of properties with client-side search filter.
 * Design: Responsive grid with loading skeletons and empty states
 * Checkpoint 4: Filter by listingType, price/rent ranges, furnished status
 */
'use client';
import React, { useMemo, useState } from 'react';
import PropertyCard from './PropertyCard.jsx';
import { useProperties } from '../lib/queries/properties';

/**
 * Skeleton Card Component for Loading State
 */
function PropertyCardSkeleton() {
  return (
    <div className="
      bg-white dark:bg-neutral-900 
      border border-neutral-200 dark:border-neutral-800 
      rounded-lg 
      overflow-hidden
      shadow-sm
      h-full
      flex flex-col
      animate-pulse
    ">
      {/* Image Skeleton */}
      <div className="aspect-video bg-neutral-200 dark:bg-neutral-800" />
      
      {/* Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded mb-2 w-3/4" />
        
        {/* Location */}
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded mb-3 w-1/2" />
        
        {/* Description lines */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6" />
        </div>
        
        {/* Footer */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-20" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ hasQuery }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      {/* House Icon */}
      <svg 
        className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mb-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
        />
      </svg>
      
      {/* Message */}
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {hasQuery ? 'No se encontraron propiedades' : 'No hay propiedades disponibles'}
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-md">
        {hasQuery 
          ? 'Intenta buscar con otros términos o revisa tu búsqueda.' 
          : 'Aún no hay propiedades publicadas. Vuelve pronto para ver nuevas opciones.'}
      </p>
    </div>
  );
}

export default function PropertyList({ 
  listingType = 'for_sale',
  searchQuery = '',
  estado = '',
  ciudad = '',
  colonia = '',
  codigoPostal = '',
  minPrice = '',
  maxPrice = '',
  minRent = '5000',
  maxRent = '50000',
  furnished = false,
  selectedAmenities = [],
  selectedServices = [],
  selectedFinancing = [],
  condition = '',
  status = '',
  minConstructionMeters = '',
  maxConstructionMeters = '',
  minLotSize = '',
  maxLotSize = '',
  showPrivate = false,
}) {
  const { data = [], isLoading } = useProperties();
  const [query, setQuery] = useState(searchQuery || '');

  React.useEffect(() => {
    setQuery(searchQuery || '');
  }, [searchQuery]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    return data.filter((p) => {
      const normalizedTitle = String(p.title || '').toLowerCase();
      const normalizedColonia = String(p.colonia || '').toLowerCase();
      const normalizedEstado = String(p.estado || '').toLowerCase();
      const normalizedCiudad = String(p.ciudad || '').toLowerCase();
      const normalizedCP = String(p.codigoPostal || '');

      // Text search filter
      const matchesQuery = !q || normalizedTitle.includes(q) || normalizedColonia.includes(q) || normalizedCiudad.includes(q);

      // Area filters
      const matchesEstado = !estado || normalizedEstado === String(estado).toLowerCase();
      const matchesCiudad = !ciudad || normalizedCiudad === String(ciudad).toLowerCase();
      const matchesColonia = !colonia || normalizedColonia.includes(String(colonia).toLowerCase());
      const matchesCodigoPostal = !codigoPostal || normalizedCP === String(codigoPostal);
      
      // Listing type filter
      const matchesListingType = p.listingType === listingType;
      
      // Price/Rent range filters
      let matchesPriceRange = true;
      if (listingType === 'for_sale') {
        const min = minPrice ? parseInt(minPrice) : 0;
        const max = maxPrice ? parseInt(maxPrice) : Infinity;
        matchesPriceRange = p.price >= min && p.price <= max;
      } else {
        const min = minRent ? parseInt(minRent) : 5000;
        const max = maxRent ? parseInt(maxRent) : 50000;
        matchesPriceRange = p.monthlyRent >= min && p.monthlyRent <= max;
      }
      
      // Furnished filter — matches if no filter selected, or property.furnished equals the filter value
      const matchesFurnished = !furnished || p.furnished === furnished;

      // Condition filter
      const matchesCondition = !condition || p.condition === condition;

      // Status filter
      const matchesStatus = !status || p.status === status;

      // Visibility filter — hide private from public views
      const matchesVisibility = showPrivate || p.visibility !== 'private';

      // Construction meters range filter
      const matchesConstructionMeters = (() => {
        const min = minConstructionMeters ? parseInt(minConstructionMeters) : 0;
        const max = maxConstructionMeters ? parseInt(maxConstructionMeters) : Infinity;
        const val = p.squareMeters || 0;
        return val >= min && val <= max;
      })();

      // Lot size range filter
      const matchesLotSize = (() => {
        const min = minLotSize ? parseInt(minLotSize) : 0;
        const max = maxLotSize ? parseInt(maxLotSize) : Infinity;
        const val = p.lotSize || 0;
        return (!minLotSize && !maxLotSize) || (val >= min && val <= max);
      })();

      // Amenities filter — property must have ALL selected amenities
      const matchesAmenities = selectedAmenities.length === 0 ||
        selectedAmenities.every(am => Array.isArray(p.amenities) && p.amenities.includes(am));

      // Services filter — property must have ALL selected services
      const matchesServices = selectedServices.length === 0 ||
        selectedServices.every(svc => Array.isArray(p.includedServices) && p.includedServices.includes(svc));

      // Financing filter — property must accept ANY of the selected financing options
      const matchesFinancing = selectedFinancing.length === 0 ||
        selectedFinancing.some(fin => Array.isArray(p.financeOptions) && p.financeOptions.includes(fin));
      
      return (
        matchesQuery &&
        matchesEstado &&
        matchesCiudad &&
        matchesColonia &&
        matchesCodigoPostal &&
        matchesCondition &&
        matchesStatus &&
        matchesVisibility &&
        matchesConstructionMeters &&
        matchesLotSize &&
        matchesListingType &&
        matchesPriceRange &&
        matchesFurnished &&
        matchesAmenities &&
        matchesServices &&
        matchesFinancing
      );
    });
  }, [
    data,
    query,
    estado,
    ciudad,
    colonia,
    codigoPostal,
    listingType,
    minPrice,
    maxPrice,
    minRent,
    maxRent,
    furnished,
    condition,
    status,
    selectedAmenities,
    selectedServices,
    selectedFinancing,
    minConstructionMeters,
    maxConstructionMeters,
    minLotSize,
    maxLotSize,
    showPrivate,
  ]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div>
        <label htmlFor="property-search" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Buscar propiedades
        </label>
        <input
          id="property-search"
          type="text"
          aria-label="Buscar propiedades"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full
            px-4 py-2.5
            bg-white dark:bg-neutral-900
            border border-neutral-300 dark:border-neutral-700
            rounded-lg
            text-neutral-900 dark:text-neutral-100
            placeholder:text-neutral-500 dark:placeholder:text-neutral-500
            focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent
            transition-shadow
          "
          placeholder="Buscar por colonia o título..."
        />
      </div>

      {!isLoading && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {filtered.length} {filtered.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
        </p>
      )}

      {/* Property Grid */}
      <div className="
        grid 
        grid-cols-1 
        md:grid-cols-2 
        lg:grid-cols-3 
        gap-6
      ">
        {/* Loading State - 6 Skeleton Cards */}
        {isLoading && (
          <>
            {[...Array(6)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </>
        )}

        {/* Loaded State - Property Cards */}
        {!isLoading && filtered.length > 0 && (
          filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))
        )}

        {/* Empty State */}
        {!isLoading && filtered.length === 0 && (
          <EmptyState hasQuery={query.trim().length > 0} />
        )}
      </div>
    </div>
  );
}
