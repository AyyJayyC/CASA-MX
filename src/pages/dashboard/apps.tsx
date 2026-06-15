import { withAuth } from "@/lib/auth-gssp"
import { Layout } from "@/components/layout/Layout"
import { useMyApplications, useUpdateApplicationStatus } from "@/lib/queries"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export const getServerSideProps = withAuth()

interface AppItem {
  id: string
  property?: { id: string; title: string }
  fullName: string
  email: string
  phone: string
  status: string
  createdAt: string
}

export default function ApplicationsPage() {
  const { data } = useMyApplications()
  const updateStatus = useUpdateApplicationStatus()
  const apps = (data as { applications?: AppItem[] })?.applications ?? []

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-6">Aplicaciones de renta</h1>

        {apps.length === 0 ? (
          <div className="bg-white border border-sand-dark/30 rounded-xl p-12 text-center">
            <p className="text-5xl mb-4">\uD83D\uDCCB</p>
            <h2 className="text-xl font-semibold text-ink mb-1">Sin aplicaciones</h2>
            <p className="text-ink-muted text-sm">Las aplicaciones para rentar propiedades aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app: AppItem) => (
              <div key={app.id} className="bg-white border border-sand-dark/30 rounded-xl p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-ink">{app.property?.title ?? "Propiedad"}</p>
                    <p className="text-sm text-ink-muted">{app.fullName} &middot; {app.email} &middot; {app.phone}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    app.status === "approved" ? "bg-green-100 text-green-700" :
                    app.status === "rejected" ? "bg-red-100 text-red-700" :
                    "bg-sand-light text-ink-muted"
                  }`}>
                    {app.status === "pending" ? "Pendiente" :
                     app.status === "under_review" ? "En revisión" :
                     app.status === "approved" ? "Aprobada" :
                     app.status === "rejected" ? "Rechazada" : app.status}
                  </span>
                </div>
                <p className="text-xs text-ink-muted">{new Date(app.createdAt).toLocaleDateString("es-MX")}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => updateStatus.mutate({ id: app.id, status: "approved" })}>Aprobar</Button>
                  <Button size="sm" variant="secondary" onClick={() => updateStatus.mutate({ id: app.id, status: "rejected" })}>Rechazar</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 space-y-1">
          <Link href="/dashboard" className="block text-sm text-clay hover:text-clay-dark">&larr; Volver al panel</Link>
        </div>
      </div>
    </Layout>
  )
}
