import { useBackendHealth } from "@/hooks/useBackendHealth"
import { useState, useEffect, useCallback } from "react"

const DISMISS_KEY = "offline-banner-dismissed"

export function OfflineBanner() {
  const { isError, isFetching, refetch } = useBackendHealth()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    sessionStorage.removeItem(DISMISS_KEY)
    setDismissed(false)
  }, [])

  useEffect(() => {
    if (!isError) {
      sessionStorage.removeItem(DISMISS_KEY)
      setDismissed(false)
    }
  }, [isError])

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, "1")
    setDismissed(true)
  }, [])

  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  if (!isError || dismissed) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-3 px-4 py-3 rounded-full shadow-lg bg-amber-50 border border-amber-300 text-amber-900 text-sm">
        <span aria-hidden="true">&#x26A0;&#xFE0F;</span>
        <span>Servidor no disponible &middot; Reintentando en 15s</span>
        <button
          onClick={handleRetry}
          disabled={isFetching}
          className="px-3 py-1 rounded-full bg-amber-200 hover:bg-amber-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetching ? "Verificando..." : "Reintentar ahora"}
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Cerrar"
          className="ml-1 p-1 rounded-full hover:bg-amber-200 transition-colors leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
