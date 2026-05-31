'use client';

/**
 * RequireAuth Guard
 * Redirects unauthenticated users to /login
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';

export function RequireAuth({ children }) {
  const router = useRouter();
  const { isAuthenticated, loading, isHydrated } = useAuth();

  useEffect(() => {
    if (!loading && isHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isHydrated, isAuthenticated, router]);

  if (loading || !isHydrated) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
