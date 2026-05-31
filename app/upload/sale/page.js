'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth/useAuth';
import PropertyUploadForm from '../../../components/PropertyUploadForm';

export default function SaleUploadPage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

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
          <p className="text-neutral-600 dark:text-neutral-400">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return <PropertyUploadForm listingType="for_sale" />;
}
