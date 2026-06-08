import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProperties,
  getPropertyById as getPropertyByIdApi,
} from "../api/properties";

export function useProperties(filters = {}) {
  return useInfiniteQuery({
    queryKey: ["properties", filters],
    queryFn: ({ pageParam = 0 }) =>
      getProperties({ ...filters, offset: pageParam, limit: 12 }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 12) return undefined;
      return allPages.length * 12;
    },
    staleTime: 1000 * 30,
    enabled: true,
  });
}

async function fetchPropertyById(id) {
  if (!id) return null;
  return (await getPropertyByIdApi(id)) || null;
}

export function useProperty(id) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchPropertyById(id),
    staleTime: 1000 * 60,
    enabled: !!id,
  });
}

export function useInvalidateProperties() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["properties"] });
}
