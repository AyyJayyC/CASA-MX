import { createContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/router"
import api from "@/lib/api"
import { getActiveRole, mapBackendRole, type User, type Role, type AuthResponse } from "@/types"

interface AuthState {
  user: User | null
  loading: boolean
  isHydrated: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string, roles: string[]) => Promise<void>
  logout: () => Promise<void>
  switchRole: (role: Role) => void
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isHydrated: false,
    error: null,
  })

  const fetchMe = useCallback(async () => {
    try {
      if (typeof window === "undefined") return
      const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/)
      if (!match) {
        setState({ user: null, loading: false, isHydrated: true, error: null })
        return
      }
      const { data } = await api.get("/auth/me")
      const backendUser = data.user
      const user: User = {
        ...backendUser,
        activeRole: getActiveRole(backendUser.roles),
        emailVerified: backendUser.emailVerified ?? false,
      }
      setState({ user, loading: false, isHydrated: true, error: null })
    } catch {
      document.cookie = "token=; path=/; max-age=0; SameSite=Strict; Secure"
      setState({ user: null, loading: false, isHydrated: true, error: null })
    }
  }, [])

  useEffect(() => {
    fetchMe()

    function handleExpired() {
      setState({ user: null, loading: false, isHydrated: true, error: null })
      router.push("/login")
    }
    window.addEventListener("auth:expired", handleExpired)
    return () => window.removeEventListener("auth:expired", handleExpired)
  }, [fetchMe, router])

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const { data } = await api.post<AuthResponse>("/auth/login", { email, password })
      const backendUser = data.user
      document.cookie = `token=${data.token}; path=/; max-age=${60 * 15}; SameSite=Strict; Secure`
      const user: User = {
        ...backendUser,
        activeRole: getActiveRole(backendUser.roles),
        emailVerified: (backendUser as Record<string, unknown>).emailVerified as boolean ?? false,
      }
      setState({ user, loading: false, isHydrated: true, error: null })
    } catch {
      const msg = "Email o contraseña incorrectos"
      setState((s) => ({ ...s, loading: false, error: msg }))
      throw new Error(msg)
    }
  }, [])

  const register = useCallback(async (email: string, name: string, password: string, _roles: string[]) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const { data } = await api.post<AuthResponse>("/auth/register", { email, name, password, roles: _roles })
      const backendUser = data.user
      document.cookie = `token=${data.token}; path=/; max-age=${60 * 15}; SameSite=Strict; Secure`
      const user: User = {
        ...backendUser,
        activeRole: getActiveRole(backendUser.roles),
        emailVerified: (backendUser as Record<string, unknown>).emailVerified as boolean ?? false,
      }
      setState({ user, loading: false, isHydrated: true, error: null })
    } catch {
      const msg = "Error al registrarse. Intenta de nuevo."
      setState((s) => ({ ...s, loading: false, error: msg }))
      throw new Error(msg)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout")
    } catch {
      // ignore network errors during logout
    }
    document.cookie = "token=; path=/; max-age=0; SameSite=Strict; Secure"
    setState({ user: null, loading: false, isHydrated: true, error: null })
    router.push("/login")
  }, [router])

  const switchRole = useCallback((role: Role) => {
    setState((s) => {
      if (!s.user) return s
      const hasRole = s.user.roles.some((r) => r.status === "approved" && mapBackendRole(r.roleName) === role)
      if (!hasRole) return s
      return { ...s, user: { ...s.user, activeRole: role } }
    })
  }, [])

  const refreshUser = useCallback(async () => {
    await fetchMe()
  }, [fetchMe])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, switchRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
