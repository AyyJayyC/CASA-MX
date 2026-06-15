import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

export function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  if (!user) return null

  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sand-light transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-clay/10 flex items-center justify-center text-sm font-medium text-clay">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <svg className={`w-4 h-4 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-sand-dark/30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-sand-dark/20">
            <p className="text-sm font-medium text-ink">{user.name}</p>
            <p className="text-xs text-ink-muted">{user.email}</p>
          </div>
          <div className="py-1">
            <Link href="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-ink-light hover:bg-sand-light/50 transition-colors">
              Panel
            </Link>
            <Link href="/dashboard/crm" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-ink-light hover:bg-sand-light/50 transition-colors">
              CRM
            </Link>
            <Link href="/settings" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-ink-light hover:bg-sand-light/50 transition-colors">
              Configuraci&oacute;n
            </Link>
            <Link href="/credits" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-ink-light hover:bg-sand-light/50 transition-colors">
              Cr&eacute;ditos
            </Link>
          </div>
          <div className="border-t border-sand-dark/20 py-1">
            <button
              onClick={() => { setOpen(false); logout() }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Cerrar sesi&oacute;n
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
