/**
 * React Query hooks for requests
 * Purpose: Centralize data access for buyer's requested properties.
 */
import { useQuery } from '@tanstack/react-query';
import { getRequestsByBuyer } from '../api/requests';

/**
 * useRequestedProperties hook for a buyer
 * @param {string} buyerId
 * @returns {{data: Array, isLoading: boolean, error: any}}
 */
export function useRequestedProperties(buyerId = 'buyer-demo') {
  return useQuery(
    ['requestedProperties', buyerId],
    () => getRequestsByBuyer(buyerId),
    { staleTime: 1000 * 60 }
  );
}
