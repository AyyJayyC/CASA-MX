"use client";

/**
 * Authentication Context
 * Provides session state, login/logout/register, and role management across the app
 */

import React, { createContext, useCallback, useEffect, useState } from "react";
import * as authAPI from "@/lib/api/auth";
import analytics from "@/lib/analytics";
import { EVENT_NAMES } from "@/lib/analytics/events";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const nextSession = await authAPI.getSession();
      if (!nextSession) {
        setSession(null);
        setUser(null);
        return null;
      }

      const nextUser = await authAPI.getUserById(nextSession.userId);
      // Update both atomically — if either fails, nothing changes
      setSession(nextSession);
      setUser(nextUser);
      return nextUser;
    } catch (err) {
      console.error("Failed to refresh user:", err);
      return null;
    }
  }, []);

  // Hydrate session from storage on mount
  useEffect(() => {
    const hydrate = async () => {
      try {
        // Only run on client side
        if (typeof window === "undefined") {
          setIsHydrated(true);
          return;
        }

        const initialSession = await authAPI.getSession();
        if (initialSession) {
          setSession(initialSession);
          const initialUser = await authAPI.getUserById(initialSession.userId);
          setUser(initialUser);
        }
      } catch (err) {
        console.error("Failed to hydrate session:", err);
        setError("Failed to load session");
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
      analytics.trackEvent(
        EVENT_NAMES.USER_REGISTER,
        { metadata: { roles: payload.roles } },
        { userId: result.user.id },
      );
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
      analytics.trackEvent(
        EVENT_NAMES.USER_LOGIN,
        {},
        { userId: result.user.id, activeRole: result.user.activeRole },
      );

      // Success - update context
      setSession({
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        avatarUrl: result.user.avatarUrl,
        emailVerified: result.user.emailVerified,
        officialIdUploaded: result.user.officialIdUploaded,
        officialIdVerified: result.user.officialIdVerified,
        paidSubscriber: result.user.paidSubscriber,
        subscriptionStatus: result.user.subscriptionStatus,
        subscriptionCurrentPeriodEnd: result.user.subscriptionCurrentPeriodEnd,
        activeRole: result.user.activeRole,
        roles: result.user.roles,
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
  const switchRole = useCallback(
    async (roleType) => {
      if (!user) {
        setError("No user logged in");
        return;
      }

      const role = user.roles.find((r) => r.type === roleType);
      if (!role) {
        setError("Role not found");
        return;
      }

      if (role.status !== "approved") {
        setError(`Role ${roleType} is not approved`);
        return;
      }

      try {
        setError(null);
        setSession((currentSession) => {
          if (!currentSession) {
            return currentSession;
          }

          return {
            ...currentSession,
            activeRole: roleType,
          };
        });
        setUser((currentUser) => {
          if (!currentUser) {
            return currentUser;
          }

          return {
            ...currentUser,
            activeRole: roleType,
          };
        });
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user],
  );

  // Login with Google ID token (from Google Sign-In)
  const loginWithGoogle = useCallback(async (idToken) => {
    try {
      setError(null);
      setLoading(true);
      const result = await authAPI.loginWithGoogle(idToken);

      setSession({
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        emailVerified: result.user.emailVerified,
        officialIdUploaded: result.user.officialIdUploaded,
        officialIdVerified: result.user.officialIdVerified,
        paidSubscriber: result.user.paidSubscriber,
        subscriptionStatus: result.user.subscriptionStatus,
        subscriptionCurrentPeriodEnd: result.user.subscriptionCurrentPeriodEnd,
        avatarUrl: result.user.avatarUrl,
        provider: result.user.provider,
        activeRole: result.user.activeRole,
        roles: result.user.roles,
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

  // Login with Facebook access token
  const loginWithFacebook = useCallback(async (accessToken) => {
    try {
      setError(null);
      setLoading(true);
      const result = await authAPI.loginWithFacebook(accessToken);

      setSession({
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        emailVerified: result.user.emailVerified,
        officialIdUploaded: result.user.officialIdUploaded,
        officialIdVerified: result.user.officialIdVerified,
        paidSubscriber: result.user.paidSubscriber,
        subscriptionStatus: result.user.subscriptionStatus,
        subscriptionCurrentPeriodEnd: result.user.subscriptionCurrentPeriodEnd,
        avatarUrl: result.user.avatarUrl,
        provider: result.user.provider,
        activeRole: result.user.activeRole,
        roles: result.user.roles,
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

  // Login with Apple
  const loginWithApple = useCallback(
    async (identityToken, authorizationCode, name) => {
      try {
        setError(null);
        setLoading(true);
        const result = await authAPI.loginWithApple(
          identityToken,
          authorizationCode,
          name,
        );

        setSession({
          userId: result.user.id,
          email: result.user.email,
          name: result.user.name,
          emailVerified: result.user.emailVerified,
          officialIdUploaded: result.user.officialIdUploaded,
          officialIdVerified: result.user.officialIdVerified,
          paidSubscriber: result.user.paidSubscriber,
          subscriptionStatus: result.user.subscriptionStatus,
          subscriptionCurrentPeriodEnd:
            result.user.subscriptionCurrentPeriodEnd,
          avatarUrl: result.user.avatarUrl,
          provider: result.user.provider,
          activeRole: result.user.activeRole,
          roles: result.user.roles,
        });
        setUser(result.user);
        setLoading(false);
        return { user: result.user };
      } catch (err) {
        setError(err.message);
        setLoading(false);
        throw err;
      }
    },
    [],
  );

  const value = {
    session,
    user,
    loading,
    isHydrated,
    error,
    isAuthenticated: !!session,
    register,
    login,
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,
    logout,
    switchRole,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
