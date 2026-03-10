/**
 * React Query hooks for requests (mocked)
 * Purpose: Centralize data access for buyer's requested properties.
 */
import { useQuery } from '@tanstack/react-query';
import { getRequestsByBuyer, requestedProperties } from '../mock/requests';
import { properties as mockProperties } from '../mock/properties';

/**
 * useRequestedProperties hook for a buyer
 * @param {string} buyerId
 * @returns {{data: Array, isLoading: boolean, error: any}}
 */
export function useRequestedProperties(buyerId = 'buyer-demo') {
  return useQuery(
    ['requestedProperties', buyerId],
    () => getRequestsByBuyer(buyerId).then((requests) => {
      // Map requests to properties
      return requests.map((req) => {
        const prop = mockProperties.find((p) => p.id === req.propertyId);
        return { ...req, property: prop };
      });
    }),
    { staleTime: 1000 * 60 }
  );
}
