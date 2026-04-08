/**
 * React Query hooks for authentication
 * Purpose: Centralize auth data access with caching and invalidation.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession, login, logout, register, refreshAccessToken } from '../api/auth';

export const AUTH_KEYS = {
  session: ['auth', 'session'],
};

/**
 * useSession — fetches and caches the current user's session
 * Returns null when unauthenticated.
 */
export function useSession() {
  return useQuery(AUTH_KEYS.session, () => getSession(), {
    staleTime: 1000 * 60 * 5, // 5 min — access token is 15 min, refresh on recompute
    retry: false,
    refetchOnWindowFocus: true,
  });
}

/**
 * useLogin — mutation that calls POST /auth/login and invalidates session
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation(
    (payload) => login(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(AUTH_KEYS.session);
      },
    }
  );
}

/**
 * useRegister — mutation that calls POST /auth/register
 */
export function useRegister() {
  return useMutation((payload) => register(payload));
}

/**
 * useLogout — mutation that calls POST /auth/logout and clears session cache
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation(
    () => logout(),
    {
      onSuccess: () => {
        queryClient.setQueryData(AUTH_KEYS.session, null);
        queryClient.removeQueries(AUTH_KEYS.session);
      },
    }
  );
}

/**
 * useRefreshToken — mutation that rotates cookies silently
 */
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation(
    () => refreshAccessToken(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(AUTH_KEYS.session);
      },
    }
  );
}
