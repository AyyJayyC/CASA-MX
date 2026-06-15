import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { AuthContext } from "@/context/AuthContext"
import type { User, Role } from "@/types"

export const mockUser: User = {
  id: "user-1",
  email: "agent@example.com",
  name: "Test Agent",
  roles: [{ roleId: "r1", roleName: "realtor", status: "approved" }],
  activeRole: "realtor" as Role,
  officialIdUploaded: true,
  officialIdVerified: true,
}

interface WrapperOptions {
  user?: User | null
  queryClient?: QueryClient
}

export function createTestWrapper(opts: WrapperOptions = {}) {
  const { user = mockUser, queryClient } = opts
  const qc = queryClient ?? new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })

  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <AuthContext.Provider
          value={{
            user,
            loading: false,
            isHydrated: true,
            error: null,
            login: async () => {},
            register: async () => {},
            logout: async () => {},
            switchRole: () => {},
            refreshUser: async () => {},
          }}
        >
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    )
  }
}
