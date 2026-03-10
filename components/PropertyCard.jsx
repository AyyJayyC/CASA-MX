/**
 * PropertyCard component (client)
 * Purpose: Present minimal property information in a card for listings.
 * Design: Gold-accented minimalist card with 16:9 image, price badge, and clean typography
 * Phase 2 Enhancements: Performance optimized, accessibility improved, blur placeholder added
 * Checkpoint 4: Conditional rendering for rental properties (monthlyRent, furnished, utilities badges)
 */
'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * @param {{property: Object}} props
 * Property object expected to have: id, title, colonia, propertyType, price, description, imageUrl, owner
 * Rental properties also have: listingType, monthlyRent, furnished, utilitiesIncluded
 */
export default function PropertyCard({ property }) {
  // Fallback image if none provided
  const imageUrl = property.imageUrl || '/placeholder-property.jpg';
  const description = property.description || 'Sin descripción disponible';
  const owner = property.owner || 'Propietario';
  const isRental = property.listingType === 'for_rent';

  return (
    <Link 
      href={`/properties/${property.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 rounded-lg"
      aria-label={`Ver detalles de ${property.title} en ${property.colonia}`}
    >
      <article 
        className="
          bg-white dark:bg-neutral-900 
          border border-neutral-200 dark:border-neutral-800 
          rounded-lg 
          overflow-hidden
          shadow-sm hover:shadow-md
          transition-shadow duration-200
          h-full
          flex flex-col
        "
        role="article"
        aria-labelledby={`property-title-${property.id}`}
      >
        {/* Image Section with Price Badge */}
        <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <Image
            src={imageUrl}
            alt={`Imagen de ${property.title}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgZmlsbD0iI2U1ZTVlNSIvPjwvc3ZnPg=="
          />
          
          {/* Price/Rent Badge - Gold Gradient Overlay */}
          <div 
            className="
              absolute top-3 right-3
              bg-gradient-to-br from-amber-400 to-yellow-600
              text-white
              px-3 py-1.5
              rounded-md
              shadow-lg
              font-semibold text-sm
            "
            aria-label={isRental 
              ? `Renta mensual: ${property.monthlyRent.toLocaleString('es-MX')} pesos mexicanos`
              : `Precio: ${property.price.toLocaleString('es-MX')} pesos mexicanos`
            }
          >
            {isRental 
              ? `$${property.monthlyRent.toLocaleString('es-MX')}/mes` 
              : `$${property.price.toLocaleString('es-MX')} MXN`
            }
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Address Title - 1 line clamp */}
          <h3 
            id={`property-title-${property.id}`}
            className="
              text-xl font-semibold 
              text-neutral-900 dark:text-neutral-100
              line-clamp-1
              mb-2
            "
          >
            {property.title}
          </h3>

          {/* Location */}
          <p className="
            text-sm 
            text-neutral-600 dark:text-neutral-400
            mb-3
          ">
            <span className="sr-only">Ubicación:</span>
            {property.colonia} • {property.propertyType}
          </p>

          {/* Rental Badges (Furnished & Utilities) */}
          {isRental && (
            <div className="flex flex-wrap gap-2 mb-3">
              {property.furnished && (
                <span className="
                  inline-flex items-center gap-1
                  px-2 py-1
                  bg-green-100 dark:bg-green-900/30
                  text-green-700 dark:text-green-400
                  text-xs font-medium
                  rounded-md
                ">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                  Amueblada
                </span>
              )}
              {property.utilitiesIncluded && (
                <span className="
                  inline-flex items-center gap-1
                  px-2 py-1
                  bg-blue-100 dark:bg-blue-900/30
                  text-blue-700 dark:text-blue-400
                  text-xs font-medium
                  rounded-md
                ">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                  </svg>
                  Servicios incluidos
                </span>
              )}
            </div>
          )}

          {/* Description - 2 line clamp */}
          <p className="
            text-sm 
            text-neutral-600 dark:text-neutral-400
            line-clamp-2
            mb-4
            flex-1
          ">
            {description}
          </p>

          {/* Footer with Border Top */}
          <div className="
            pt-4 
            border-t border-neutral-200 dark:border-neutral-800
            flex items-center justify-between
          ">
            {/* Owner Info */}
            <span className="text-xs text-neutral-500 dark:text-neutral-500">
              <span className="sr-only">Publicado</span> Por: {owner}
            </span>

            {/* View Details Link - Gold */}
            <span 
              className="
                text-sm font-medium
                text-amber-600 dark:text-amber-400
                group-hover:text-amber-700 dark:group-hover:text-amber-300
                flex items-center gap-1
              "
              aria-hidden="true"
            >
              Ver detalles
              <svg 
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
