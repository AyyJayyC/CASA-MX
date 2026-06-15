import { withAdmin } from "@/lib/auth-admin"
import { Layout } from "@/components/layout/Layout"
import Link from "next/link"
import { useAdminPendingRoles, useApproveRole, useDenyRole } from "@/lib/queries"
import { Button } from "@/components/ui/Button"

export const getServerSideProps = withAdmin()

const TABS = [
  { href: "/admin", label: "Analítica" },
  { href: "/admin/approvals", label: "Aprobaciones" },
  { href: "/admin/properties", label: "Propiedades" },
]

interface PendingRoleItem {
  userRoleId: string
  user?: { id: string; name: string; email: string }
  roleName: string
  status: string
  documentUrls: string[]
  createdAt: string
}

export default function AdminApprovalsPage() {
  const { data, isLoading } = useAdminPendingRoles()
  const approve = useApproveRole()
  const deny = useDenyRole()
  const pendingRoles = (data as { data?: PendingRoleItem[] })?.data ?? []

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-6">Administración</h1>

        <div className="flex gap-1 mb-8 bg-sand-light/50 p-1 rounded-lg w-fit">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${t.href === "/admin/approvals" ? "bg-white text-clay shadow-sm" : "text-ink-light hover:text-ink"}`}>{t.label}</Link>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-ink-muted">Cargando...</div>
        ) : pendingRoles.length === 0 ? (
          <div className="bg-white border border-sand-dark/30 rounded-xl p-12 text-center">
            <p className="text-5xl mb-4">\u2705</p>
            <h2 className="text-xl font-semibold text-ink mb-1">Sin aprobaciones pendientes</h2>
            <p className="text-ink-muted text-sm">No hay roles ni documentos esperando revisión.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRoles.map((r: PendingRoleItem) => (
              <div key={r.userRoleId} className="bg-white border border-sand-dark/30 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-ink">{r.user?.name ?? "Usuario"}</p>
                    <p className="text-sm text-ink-muted">{r.user?.email}</p>
                    <p className="text-xs text-ink-muted mt-1">
                      Rol: {r.roleName} &middot; {new Date(r.createdAt).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pendiente</span>
                </div>
                {r.documentUrls && r.documentUrls.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {r.documentUrls.map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs text-clay hover:text-clay-dark underline">Documento {i + 1}</a>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approve.mutate(r.userRoleId)}>Aprobar</Button>
                  <Button size="sm" variant="secondary" onClick={() => deny.mutate(r.userRoleId)}>Rechazar</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
