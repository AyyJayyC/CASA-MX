import type { ReactNode } from "react"
import { NavBar } from "./NavBar"
import { Logo } from "@/components/ui/Logo"

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <NavBar />
      <main>{children}</main>
      <footer className="border-t border-sand-dark/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <Logo size="sm" showText={false} asLink={false} />
            <p className="text-sm text-ink-muted italic">Tu Ruta, Tu Decisi&oacute;n</p>
          </div>
          <p className="text-center text-xs text-ink-muted">
            &copy; {new Date().getFullYear()} CASA MX. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
