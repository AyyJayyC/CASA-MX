/**
 * Global Error Boundary Handler
 * Purpose: Catch runtime errors and display user-friendly error page
 * Language: Spanish (Spanish UI - Casa MX platform)
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error for monitoring
    console.error('Error capturado:', error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-neutral-900 dark:to-neutral-800">
          <div className="max-w-md w-full mx-4 p-8 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-red-200 dark:border-red-900">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-center text-red-700 dark:text-red-400 mb-3">
              ¡Algo salió mal!
            </h1>

            {/* Error Message */}
            <p className="text-center text-neutral-600 dark:text-neutral-400 mb-6">
              Lamentamos los inconvenientes. Se produjo un error inesperado mientras procesábamos tu solicitud.
            </p>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                <p className="text-sm font-mono text-red-800 dark:text-red-300 break-words">
                  {error?.message || 'Error desconocido'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Retry Button */}
              <button
                onClick={() => reset()}
                className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Intentar de nuevo
              </button>

              {/* Return Home Button */}
              <Link
                href="/"
                className="block w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium text-center transition-colors duration-200"
              >
                🏠 Regresar al inicio
              </Link>

              {/* Return to Properties Button */}
              <Link
                href="/properties"
                className="block w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium text-center transition-colors duration-200"
              >
                🏢 Ver Propiedades
              </Link>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700 text-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                Si el problema persiste, por favor contacta con nuestro equipo de soporte.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
