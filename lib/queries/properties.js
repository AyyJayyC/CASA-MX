/**
 * React Query hooks for properties
 * Purpose: Centralize data access and keep components simple.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProperties, getPropertyById as getPropertyByIdApi } from '../api/properties';

/**
 * Fetch properties from backend API
 */
async function fetchProperties() {
  try {
    const data = await getProperties();
    return data || [];
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return [];
  }
}

/**
 * useProperties hook
 * @returns {{data: Array, isLoading: boolean, error: any}}
 */
export function useProperties() {
  return useQuery(['properties'], fetchProperties, { 
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true
  });
}

/**
 * Hook to invalidate properties cache and refetch
 */
export function useInvalidateProperties() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries(['properties']);
}

/**
 * Utility to get single property by id from mock store.
 * @param {string} id
 */
export function getPropertyById(id) {
  return getPropertyByIdApi(id);
}
