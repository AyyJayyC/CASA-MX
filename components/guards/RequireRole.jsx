'use client';

/**
 * RequireRole Guard
 * Redirects users without required role to /
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';

export function RequireRole({ children, roles = [], allowInProduction = true }) {
  const router = useRouter();
  const { isAuthenticated, loading, user, isHydrated } = useAuth();
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    if (!loading && isHydrated) {
      if (!allowInProduction && isProduction) {
        router.replace('/');
        return;
      }

      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      // Check if user has required role
      if (roles.length > 0 && user) {
        const hasRole = user.roles.some(
          (r) => roles.includes(r.type) && r.status === 'approved'
        );

        if (!hasRole) {
          router.replace('/');
        }
      }
    }
  }, [loading, isHydrated, isAuthenticated, user, router, allowInProduction, isProduction]);

  if (loading || !isHydrated) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!allowInProduction && isProduction) {
    return null;
  }

  if (roles.length > 0 && user) {
    const hasRole = user.roles.some(
      (r) => roles.includes(r.type) && r.status === 'approved'
    );
    if (!hasRole) {
      return null;
    }
  }

  return children;
}
