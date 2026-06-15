import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const RETRY_KEY = Symbol("retry")

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/)
    const token = match ? decodeURIComponent(match[1]) : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || (original as Record<symbol, boolean>)[RETRY_KEY]) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    ;(original as Record<symbol, boolean>)[RETRY_KEY] = true
    isRefreshing = true

    const currentToken = original.headers?.Authorization?.replace("Bearer ", "")
      || (typeof window !== "undefined" ? (document.cookie.match(/(?:^|;\s*)token=([^;]*)/)?.[1] ?? "") : "")

    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, {
        headers: { Authorization: `Bearer ${currentToken}` },
      })

      const newToken = data.token
      document.cookie = `token=${newToken}; path=/; max-age=${60 * 15}; SameSite=Strict; Secure`
      original.headers.Authorization = `Bearer ${newToken}`

      refreshQueue.forEach((q) => q.resolve(newToken))
      refreshQueue = []

      return api(original)
    } catch (refreshError) {
      refreshQueue.forEach((q) => q.reject(refreshError))
      refreshQueue = []
      document.cookie = "token=; path=/; max-age=0; SameSite=Strict; Secure"
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:expired"))
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
