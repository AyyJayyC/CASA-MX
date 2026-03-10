/**
 * Landlord Dashboard - Applications Page
 * Purpose: Display rental applications for landlord's properties with approve/reject actions
 * Design: Responsive applications table with status filters and action modals
 * Checkpoint 6: Integrates with GET /applications/property/:id and PATCH /applications/:id
 */
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ApplicationsTable = dynamic(() => import('../../../components/ApplicationsTable.jsx'), { ssr: false });

export default function LandlordDashboard() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, under_review, approved, rejected
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeoutError, setTimeoutError] = useState(null);

  useEffect(() => {
    // In production, fetch landlord's properties from backend
    // For now, use mock data from localStorage (from property uploads)
    const loadProperties = async () => {
      const timeoutMs = 10000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        setIsLoading(true);
        setTimeoutError(null);
        // TODO: Replace with actual API call to get landlord's properties
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/my-properties`, {
        //   headers: { 'Authorization': `Bearer ${token}` },
        //   signal: controller.signal,
        // });
        
        // For MVP, we'll show a message that this feature requires backend integration
        setProperties([]);
        setError(null);
      } catch (err) {
        if (err?.name === 'AbortError') {
          setTimeoutError('La carga está tardando demasiado. Intenta de nuevo.');
          setError(null);
        } else {
          setError('Error loading properties: ' + err.message);
        }
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    loadProperties();
  }, []);

  const statusOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'under_review', label: 'En revisión' },
    { value: 'approved', label: 'Aprobadas' },
    { value: 'rejected', label: 'Rechazadas' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Page Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container max-w-7xl py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Panel de Control
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Administra las solicitudes de renta de tus propiedades
              </p>
            </div>
            <Link
              href="/properties"
              className="
                inline-flex items-center gap-2
                px-4 py-2
                text-sm font-medium
                text-neutral-600 dark:text-neutral-400
                hover:text-amber-600 dark:hover:text-amber-400
                transition-colors
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l-7-7 7-7" />
              </svg>
              Volver
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {timeoutError && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-sm">
            {timeoutError}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-amber-600 mx-auto mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-neutral-600 dark:text-neutral-400">Cargando solicitudes...</p>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-12 text-center">
            <svg className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              No tienes propiedades para rentar
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Publica propiedades para renta para que los inquilinos puedan solicitar.
            </p>
            <Link
              href="/properties"
              className="
                inline-flex items-center gap-2
                px-6 py-3
                bg-gradient-to-br from-amber-400 to-yellow-600
                hover:from-amber-500 hover:to-yellow-700
                text-white font-semibold rounded-lg
                transition-all
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Publicar propiedad
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Property Selector */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Seleccionar propiedad
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((prop) => (
                  <button
                    key={prop.id}
                    onClick={() => setSelectedProperty(prop.id)}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${selectedProperty === prop.id
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-amber-400'
                      }
                    `}
                  >
                    <div className="font-medium text-neutral-900 dark:text-neutral-100 text-left">
                      {prop.title}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 text-left mt-1">
                      {prop.colonia}
                    </div>
                    <div className="text-sm font-semibold text-amber-600 dark:text-amber-400 text-left mt-2">
                      ${prop.monthlyRent?.toLocaleString('es-MX')} MXN
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedProperty && (
              <>
                {/* Status Filter */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Filtrar por estado
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setStatusFilter(option.value)}
                        className={`
                          px-4 py-2 rounded-lg font-medium text-sm transition-all
                          ${statusFilter === option.value
                            ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          }
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Applications Table */}
                <ApplicationsTable
                  propertyId={selectedProperty}
                  statusFilter={statusFilter}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
