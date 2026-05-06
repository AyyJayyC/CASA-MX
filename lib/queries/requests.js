/**
 * React Query hooks for contact requests
 */
import { useQuery } from '@tanstack/react-query';
import { getMyRequests, getSellerRequests } from '../api/requests';

export function useMyContactRequests() {
  return useQuery(['myContactRequests'], () => getMyRequests(), {
    staleTime: 1000 * 60,
  });
}

export function useSellerContactRequests() {
  return useQuery(['sellerContactRequests'], () => getSellerRequests(), {
    staleTime: 1000 * 60,
  });
}

