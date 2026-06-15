import { describe, it, expect, vi } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createElement } from "react"
import { useBackendHealth } from "@/hooks/useBackendHealth"
import api from "@/lib/api"
import type { ReactNode } from "react"

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0, staleTime: 0 } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe("useBackendHealth", () => {
  it("calls api.get with /health and timeout: 5000", async () => {
    const mockGet = vi.mocked(api.get)
    mockGet.mockResolvedValue({ data: { status: "ok" } })

    const { result } = renderHook(() => useBackendHealth(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockGet).toHaveBeenCalledWith("/health", { timeout: 5000 })
  })
})
