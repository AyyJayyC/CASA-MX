'use client';

/**
 * Authentication Context
 * Provides session state, login/logout/register, and role management across the app
 */

import React, { createContext, useCallback, useEffect, useState } from 'react';
import * as authAPI from '@/lib/api/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate session from storage on mount
  useEffect(() => {
    const hydrate = async () => {
      try {
        // Only run on client side
        if (typeof window === 'undefined') {
          setIsHydrated(true);
          return;
        }
        
        const session = await authAPI.getSession();
        if (session) {
          setSession(session);
          const user = await authAPI.getUserById(session.userId);
          setUser(user);
        }
      } catch (err) {
        console.error('Failed to hydrate session:', err);
        setError('Failed to load session');
      } finally {
        setIsHydrated(true);
      }
    };

    hydrate();
  }, []);

  // Register a new user
  const register = useCallback(async (payload) => {
    try {
      setError(null);
      const result = await authAPI.register(payload);
      // Don't auto-login; wait for admin approval
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Login with email and password
  const login = useCallback(async (payload) => {
    try {
      setError(null);
      setLoading(true);
      const result = await authAPI.login(payload);

      // Success - update context
      setSession({
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        activeRole: result.user.activeRole,
        roles: result.user.roles,
        token: result.token,
        refreshToken: result.refreshToken,
      });
      setUser(result.user);
      setLoading(false);
      return { user: result.user };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      setError(null);
      await authAPI.logout();
      setSession(null);
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Change active role (must be approved)
  const switchRole = useCallback(async (roleType) => {
    if (!user) {
      setError('No user logged in');
      return;
    }

    const role = user.roles.find((r) => r.type === roleType);
    if (!role) {
      setError('Role not found');
      return;
    }

    if (role.status !== 'approved') {
      setError(`Role ${roleType} is not approved`);
      return;
    }

    try {
      setError(null);
      const result = await authAPI.login({
        email: user.email,
        role: roleType
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSession({
        ...session,
        activeRole: roleType
      });
      setUser(result.user);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user, session]);

  const value = {
    session,
    user,
    loading,
    isHydrated,
    error,
    isAuthenticated: !!session,
    register,
    login,
    logout,
    switchRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
