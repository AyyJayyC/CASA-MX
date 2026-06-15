import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useNotifications } from "@/lib/queries"

interface NotifItem { id: string; title: string; message: string; read: boolean; createdAt: string }

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data: notifData } = useNotifications()
  const raw = (notifData as { data?: { notifications?: NotifItem[]; unreadCount?: number } })?.data?.notifications ?? []
  const notifications = raw
  const count = (notifData as { data?: { unreadCount?: number } })?.data?.unreadCount ?? 0

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-sand-light transition-colors"
        aria-label="Notificaciones"
      >
        <svg className="w-5 h-5 text-ink-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-sand-dark/30 overflow-hidden z-50">
          <div className="p-3 border-b border-sand-dark/20">
            <p className="text-sm font-semibold text-ink">Notificaciones</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-ink-muted text-center py-8">Sin notificaciones</p>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-sand-dark/10 last:border-0 ${n.read ? "" : "bg-clay/5"}`}>
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  <p className="text-xs text-ink-muted truncate">{n.message}</p>
                  <p className="text-xs text-ink-muted mt-1">{new Date(n.createdAt).toLocaleString("es-MX")}</p>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="block text-center text-xs text-clay hover:text-clay-dark py-2 border-t border-sand-dark/20">
              Ver todas
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
