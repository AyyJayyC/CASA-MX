import { useQuery } from "@tanstack/react-query";
import { getMyRequests, getSellerRequests } from "../api/requests";

export function useMyContactRequests() {
  return useQuery({
    queryKey: ["myContactRequests"],
    queryFn: () => getMyRequests(),
    staleTime: 1000 * 60,
  });
}

export function useSellerContactRequests() {
  return useQuery({
    queryKey: ["sellerContactRequests"],
    queryFn: () => getSellerRequests(),
    staleTime: 1000 * 60,
  });
}
