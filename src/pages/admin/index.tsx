import { withAdmin } from "@/lib/auth-admin"
import { Layout } from "@/components/layout/Layout"
import Link from "next/link"
import { useProperties, useAdminPendingRoles, useCreditBalance } from "@/lib/queries"
import { useState } from "react"

export const getServerSideProps = withAdmin()

export default function AdminAnalyticsPage() {
  const { data: propsData } = useProperties({ limit: 100 })
  const { data: pendingData } = useAdminPendingRoles()
  const [activeTab, setActiveTab] = useState<"overview" | "carousel" | "agencies">("overview")

  const totalProperties = propsData?.total ?? 0
  const pendingApprovals = (pendingData as { data?: unknown[] })?.data?.length ?? 0
  const activeProperties = propsData?.data?.filter((p) => p.status === "disponible").length ?? 0

  const tabs = [
    { key: "overview" as const, label: "General" },
    { key: "carousel" as const, label: "Carousel" },
    { key: "agencies" as const, label: "Agencias" },
  ]

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-ink">Administración</h1>
          <div className="flex gap-1 bg-sand-light/50 p-1 rounded-lg">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === t.key ? "bg-white text-clay shadow-sm" : "text-ink-light hover:text-ink"}`}>{t.label}</button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-sand-dark/30 rounded-xl p-5">
                <p className="text-2xl font-bold text-clay">{totalProperties}</p>
                <p className="text-sm text-ink-muted">Propiedades totales</p>
              </div>
              <div className="bg-white border border-sand-dark/30 rounded-xl p-5">
                <p className="text-2xl font-bold text-clay">{activeProperties}</p>
                <p className="text-sm text-ink-muted">Activas</p>
              </div>
              <div className="bg-white border border-sand-dark/30 rounded-xl p-5">
                <p className="text-2xl font-bold text-clay">{pendingApprovals}</p>
                <p className="text-sm text-ink-muted">Aprobaciones pendientes</p>
              </div>
              <div className="bg-white border border-sand-dark/30 rounded-xl p-5">
                <p className="text-2xl font-bold text-clay">—</p>
                <p className="text-sm text-ink-muted">Ingresos del mes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-sand-dark/30 rounded-xl p-6">
                <h3 className="font-semibold text-ink mb-3">Propiedades por tipo</h3>
                <div className="space-y-2">
                  {["Casa", "Departamento", "Terreno", "Local comercial", "Oficina"].map((t) => {
                    const count = propsData?.data?.filter((p) => p.propertyType === t).length ?? 0
                    return (
                      <div key={t} className="flex items-center justify-between text-sm">
                        <span className="text-ink-light">{t}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-sand-light rounded-full h-2">
                            <div className="bg-clay h-2 rounded-full" style={{ width: `${Math.min(100, (count / Math.max(1, totalProperties)) * 100)}%` }} />
                          </div>
                          <span className="text-ink-muted w-6 text-right">{count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white border border-sand-dark/30 rounded-xl p-6">
                <h3 className="font-semibold text-ink mb-3">Propiedades por estado</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {propsData?.data?.reduce<Array<{ estado: string; count: number }>>((acc, p) => {
                    const existing = acc.find((a) => a.estado === p.estado)
                    if (existing) existing.count++
                    else acc.push({ estado: p.estado, count: 1 })
                    return acc
                  }, []).sort((a, b) => b.count - a.count).slice(0, 10).map((s) => (
                    <div key={s.estado} className="flex items-center justify-between text-sm">
                      <span className="text-ink-light">{s.estado}</span>
                      <span className="text-ink-muted">{s.count}</span>
                    </div>
                  ))}
                  {!propsData?.data?.length && <p className="text-sm text-ink-muted py-4 text-center">Sin datos</p>}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/admin/approvals" className="text-sm text-clay hover:text-clay-dark text-center p-3 bg-clay/5 rounded-lg">Aprobaciones pendientes</Link>
              <Link href="/admin/carousel" className="text-sm text-clay hover:text-clay-dark text-center p-3 bg-clay/5 rounded-lg">Gestión de Carrusel</Link>
              <Link href="/admin/properties" className="text-sm text-clay hover:text-clay-dark text-center p-3 bg-clay/5 rounded-lg">Todas las propiedades</Link>
            </div>
          </>
        )}

        {activeTab === "carousel" && (
          <div className="bg-white border border-sand-dark/30 rounded-xl p-12 text-center">
            <p className="text-ink-muted text-sm mb-4">Gestiona los slides del carrusel de la página principal.</p>
            <Link href="/admin/carousel" className="text-clay font-medium hover:text-clay-dark">Ir a Carrusel &rarr;</Link>
          </div>
        )}

        {activeTab === "agencies" && (
          <div className="bg-white border border-sand-dark/30 rounded-xl p-12 text-center">
            <p className="text-ink-muted text-sm">Gestión de agencias inmobiliarias.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
