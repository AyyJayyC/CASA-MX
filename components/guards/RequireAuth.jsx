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
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
