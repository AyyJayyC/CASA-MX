import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { ROLE_LABELS, mapBackendRole, type Role } from "@/types"

export function RoleSwitcher() {
  const { user, switchRole } = useAuth()
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

  const availableRoles: Role[] = (["seeker", "owner", "realtor", "admin"] as Role[]).filter(
    (r) => user.roles.some((ur) => ur.status === "approved" && mapBackendRole(ur.roleName) === r)
  )

  if (availableRoles.length <= 1) return null

  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-clay bg-sand-light rounded-full border border-clay/20 hover:bg-clay/10 transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-clay animate-pulse" />
        {ROLE_LABELS[user.activeRole]}
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-sand-dark/30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {availableRoles.map((role) => (
            <button
              key={role}
              onClick={() => { switchRole(role); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${role === user.activeRole ? "bg-sand-light text-clay font-medium" : "text-ink-light hover:bg-sand-light/50"}`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${role === user.activeRole ? "bg-clay" : "bg-sand-dark"}`} />
              {ROLE_LABELS[role]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
