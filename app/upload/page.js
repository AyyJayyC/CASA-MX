/**
 * Upload page for sellers/wholesalers
 * Purpose: Provide UI for uploading properties.
 * Design: Centered form with gold accents and clear sections
 */
'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth/useAuth';

// Load as client component
const PropertyUploadForm = dynamic(() => import('../../components/PropertyUploadForm.jsx'), { ssr: false });

export default function UploadPage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [isHydrated, user, router]);

  // Show loading while checking authentication
  if (isLoading || !isHydrated || !user) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-amber-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-neutral-600 dark:text-neutral-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 sm:py-12">
      <div className="container max-w-2xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="
            text-3xl sm:text-4xl 
            font-bold 
            text-neutral-900 dark:text-neutral-100
            mb-3
          ">
            Publicar propiedad
          </h1>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Completa la información de tu propiedad. Los campos marcados con * son obligatorios.
            </p>
          </div>
          {/* Gold Accent Line */}
          <div className="mt-4 h-1 w-20 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-full" />
        </div>

        {/* Form Card */}
        <div className="
          bg-white dark:bg-neutral-900
          border border-neutral-200 dark:border-neutral-800
          rounded-lg
          p-6 sm:p-8
          shadow-sm
        ">
          <PropertyUploadForm />
        </div>

        {/* Helper Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            ¿Necesitas ayuda? Contacta a nuestro equipo de soporte
          </p>
        </div>
      </div>
    </div>
  );
}
