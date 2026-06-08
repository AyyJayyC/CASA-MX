/**
 * React Query hooks for properties
 * Purpose: Centralize data access and keep components simple.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProperties,
  getPropertyById as getPropertyByIdApi,
} from "../api/properties";

/**
 * Fetch properties from backend API
 */
async function fetchProperties() {
  const data = await getProperties();
  return data || [];
}

/**
 * useProperties hook
 * @returns {{data: Array, isLoading: boolean, error: any}}
 */
export function useProperties() {
  return useQuery(["properties"], fetchProperties, {
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch a single property by ID
 * @param {string} id
 */
async function fetchPropertyById(id) {
  if (!id) return null;
  const data = await getPropertyByIdApi(id);
  return data || null;
}

/**
 * useProperty hook
 * @param {string} id
 * @returns {{data: any, isLoading: boolean, error: any}}
 */
export function useProperty(id) {
  return useQuery(["property", id], () => fetchPropertyById(id), {
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
}

/**
 * Hook to invalidate properties cache and refetch
 */
export function useInvalidateProperties() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries(["properties"]);
}

/**
 * Utility to get single property by id from API.
 * @param {string} id
 */
export function getPropertyById(id) {
  return getPropertyByIdApi(id);
}
