/**
 * RequestedPropertiesList (client)
 * Purpose: Show buyer their list of requested properties.
 */
'use client';
import React from 'react';
import Link from 'next/link';
import { useRequestedProperties } from '../lib/queries/requests';

export default function RequestedPropertiesList() {
  const { data = [], isLoading } = useRequestedProperties();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg className="animate-spin h-10 w-10 text-amber-500 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-neutral-600 dark:text-neutral-400">Cargando solicitudes...</p>
      </div>
    );
  }

  return (
    <div>
      {data.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No hay solicitudes
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            No has solicitado información sobre propiedades aún
          </p>
          <Link
            href="/properties"
            className="
              inline-flex items-center gap-2 px-6 py-3
              bg-gradient-to-br from-amber-400 to-yellow-600
              hover:from-amber-500 hover:to-yellow-700
              text-white font-semibold
              rounded-lg
              transition-all
              shadow-md hover:shadow-lg
            "
          >
            Explorar propiedades
          </Link>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Total: {data.length} {data.length === 1 ? 'solicitud' : 'solicitudes'}
            </span>
          </div>
          
          <div className="grid gap-4">
            {data.map((req) => (
              <div 
                key={req.id} 
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 mb-2">
                      {req.property?.title || 'Propiedad desconocida'}
                    </h3>
                    <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(req.createdAt).toLocaleDateString('es-MX')}
                      </p>
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.754 2 11.416 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zm-8-3a1 1 0 100 2h.01a1 1 0 100-2H10zm-3 1a1 1 0 011-1h.01a1 1 0 110 2H8a1 1 0 01-1-1zm6 0a1 1 0 011-1h.01a1 1 0 110 2H14a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        {req.message ? 'Información enviada' : 'Solicitud enviada'}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    href={`/properties/${req.propertyId}`}
                    className="
                      inline-flex items-center justify-center gap-2 px-5 py-2.5
                      bg-amber-100 hover:bg-amber-200
                      dark:bg-amber-900/30 dark:hover:bg-amber-900/50
                      text-amber-900 dark:text-amber-400
                      font-medium text-sm
                      rounded-lg
                      transition-colors
                    "
                  >
                    Ver propiedad
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
