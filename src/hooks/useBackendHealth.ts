import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"

interface HealthResponse {
  status: string
  checks?: Record<string, string>
}

export function useBackendHealth() {
  return useQuery<HealthResponse>({
    queryKey: ["backend-health"],
    queryFn: async () => {
      const { data } = await api.get<HealthResponse>("/health", { timeout: 5000 })
      return data
    },
    refetchInterval: 15_000,
    retry: 1,
    retryDelay: 5_000,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  })
}
