/**
 * Property Type Selection Page
 * Purpose: Let user choose between Sale or Rental before uploading
 * Design: Clean modal-like interface with two options
 */
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/useAuth';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PublishPropertyPage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    // Redirect to login if not authenticated
    if (!user) {
      router.replace('/login');
      return;
    }
    setIsLoading(false);
  }, [isHydrated, user, router]);

  if (isLoading || !isHydrated || !user) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-clay mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-neutral-600 dark:text-neutral-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center py-8 px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            ¿Qué tipo de propiedad deseas publicar?
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">
            Selecciona si deseas vender o rentar tu propiedad
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Sale Option */}
          <Link href="/upload/sale">
            <button className="w-full h-full">
              <div className="
                h-full p-8 rounded-lg border-2 border-neutral-200 dark:border-neutral-800
                bg-white dark:bg-neutral-900
                hover:border-clay dark:hover:border-clay
                hover:shadow-lg dark:hover:shadow-lg/10
                transition-all duration-300 cursor-pointer
                flex flex-col items-center justify-center
              ">
                {/* Icon */}
                <div className="
                  w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30
                  flex items-center justify-center mb-4
                  group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors
                ">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  Venta
                </h2>

                {/* Description */}
                <p className="text-neutral-600 dark:text-neutral-400 text-center mb-4">
                  Vende tu propiedad y encuentra el comprador perfecto
                </p>

                {/* Features */}
                <ul className="space-y-2 w-full text-left text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Precio flexible
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Muchos compradores
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Cierre rápido
                  </li>
                </ul>

                {/* CTA Button */}
                <div className="w-full mt-auto">
                  <span className="
                    inline-flex items-center justify-center w-full gap-2
                    px-6 py-3
                    bg-gradient-to-br from-blue-400 to-blue-600
                    hover:from-blue-500 hover:to-blue-700
                    text-white font-semibold rounded-lg
                    transition-all
                  ">
                    Publicar para Venta
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>
          </Link>

          {/* Rental Option */}
          <Link href="/upload/rental">
            <button className="w-full h-full">
              <div className="
                h-full p-8 rounded-lg border-2 border-neutral-200 dark:border-neutral-800
                bg-white dark:bg-neutral-900
                hover:border-clay dark:hover:border-clay
                hover:shadow-lg dark:hover:shadow-lg/10
                transition-all duration-300 cursor-pointer
                flex flex-col items-center justify-center
              ">
                {/* Icon */}
                <div className="
                  w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30
                  flex items-center justify-center mb-4
                  group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors
                ">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  Renta
                </h2>

                {/* Description */}
                <p className="text-neutral-600 dark:text-neutral-400 text-center mb-4">
                  Renta tu propiedad y obtén ingresos recurrentes
                </p>

                {/* Features */}
                <ul className="space-y-2 w-full text-left text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Ingresos mensuales
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Inquilinos verificados
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Fácil de administrar
                  </li>
                </ul>

                {/* CTA Button */}
                <div className="w-full mt-auto">
                  <span className="
                    inline-flex items-center justify-center w-full gap-2
                    px-6 py-3
                    bg-gradient-to-br from-green-400 to-green-600
                    hover:from-green-500 hover:to-green-700
                    text-white font-semibold rounded-lg
                    transition-all
                  ">
                    Publicar para Renta
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>
          </Link>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link 
            href="/properties"
            className="text-clay dark:text-clay hover:text-clay dark:hover:text-amber-300 font-medium transition-colors"
          >
            ← Volver a propiedades
          </Link>
        </div>
      </div>
    </div>
  );
}
