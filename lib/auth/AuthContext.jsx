"use client";

import React, { createContext, useCallback, useEffect, useState } from "react";
import * as authAPI from "@/lib/api/auth";
import analytics from "@/lib/analytics";
import { EVENT_NAMES } from "@/lib/analytics/events";

export const AuthContext = createContext();

function buildSession(user) {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    officialIdUploaded: user.officialIdUploaded,
    officialIdVerified: user.officialIdVerified,
    paidSubscriber: user.paidSubscriber,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    activeRole: user.activeRole,
    roles: user.roles,
  };
}

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
      setSession(nextSession);
      setUser(nextUser);
      return nextUser;
    } catch (err) {
      console.error("Failed to refresh user:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      try {
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

  const register = useCallback(async (payload) => {
    try {
      setError(null);
      const result = await authAPI.register(payload);
      analytics.trackEvent(
        EVENT_NAMES.USER_REGISTER,
        { metadata: { roles: payload.roles } },
        { userId: result.user.id }
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const login = useCallback(async (payload) => {
    try {
      setError(null);
      setLoading(true);
      const result = await authAPI.login(payload);
      analytics.trackEvent(
        EVENT_NAMES.USER_LOGIN,
        {},
        { userId: result.user.id, activeRole: result.user.activeRole }
      );
      setSession(buildSession(result.user));
      setUser(result.user);
      setLoading(false);
      return { user: result.user };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const loginWithProvider = useCallback(async (provider, ...args) => {
    try {
      setError(null);
      setLoading(true);

      const apiCall = {
        google: () => authAPI.loginWithGoogle(args[0]),
        facebook: () => authAPI.loginWithFacebook(args[0]),
        apple: () => authAPI.loginWithApple(args[0], args[1], args[2]),
      }[provider];

      if (!apiCall) throw new Error(`Unknown provider: ${provider}`);
      const result = await apiCall();

      setSession(buildSession(result.user));
      setUser(result.user);
      setLoading(false);
      return { user: result.user };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

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
        setSession((prev) => (prev ? { ...prev, activeRole: roleType } : prev));
        setUser((prev) => (prev ? { ...prev, activeRole: roleType } : prev));
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
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
    loginWithGoogle: (...args) => loginWithProvider("google", ...args),
    loginWithFacebook: (...args) => loginWithProvider("facebook", ...args),
    loginWithApple: (...args) => loginWithProvider("apple", ...args),
    logout,
    switchRole,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
