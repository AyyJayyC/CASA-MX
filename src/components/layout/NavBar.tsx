import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { RoleSwitcher } from "./RoleSwitcher"
import { UserMenu } from "./UserMenu"
import { NotificationBell } from "./NotificationBell"
import { Logo } from "@/components/ui/Logo"
import { ROLE_LABELS } from "@/types"

const PlusIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

export function NavBar() {
  const { user } = useAuth()
  const router = useRouter()
  const [q, setQ] = useState("")

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (q.trim()) {
      router.push(`/properties?ciudad=${encodeURIComponent(q.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sand-dark/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo size="nav" />

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-3 py-2 text-sm font-medium text-ink-light hover:text-ink rounded-md hover:bg-sand-light transition-colors">
              Inicio
            </Link>
            <Link href="/properties" className="px-3 py-2 text-sm font-medium text-ink-light hover:text-ink rounded-md hover:bg-sand-light transition-colors">
              Propiedades
            </Link>
            <Link href="/map" className="px-3 py-2 text-sm font-medium text-ink-light hover:text-ink rounded-md hover:bg-sand-light transition-colors">
              Mapa
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="hidden md:block w-48">
            <input
              type="text"
              placeholder="Buscar..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-lg border border-sand-dark/50 bg-sand-light/50 px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay/50"
            />
          </form>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-ink-muted bg-sand-light px-2.5 py-1 rounded-full border border-sand-dark/30">
                {ROLE_LABELS[user.activeRole]}
              </span>
              {user.activeRole !== "seeker" && (
                <Link href="/publish" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-clay rounded-lg hover:bg-clay-dark transition-colors">
                  {PlusIcon}
                  Publicar
                </Link>
              )}
              {user.activeRole !== "seeker" && (
                <Link href="/publish" aria-label="Publicar" className="sm:hidden inline-flex items-center justify-center w-9 h-9 text-white bg-clay rounded-full hover:bg-clay-dark transition-colors">
                  {PlusIcon}
                </Link>
              )}
              <NotificationBell />
              <RoleSwitcher />
              <UserMenu />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-ink-light hover:text-ink rounded-lg hover:bg-sand-light transition-colors">
                Iniciar sesión
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-clay rounded-lg hover:bg-clay-dark transition-colors">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
