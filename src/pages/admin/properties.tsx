import { withAdmin } from "@/lib/auth-admin"
import { Layout } from "@/components/layout/Layout"
import Link from "next/link"
import { useAdminAllProperties, usePromoteProperty } from "@/lib/queries"
import { formatPrice } from "@/lib/format"
import { Button } from "@/components/ui/Button"

export const getServerSideProps = withAdmin()

const TABS = [
  { href: "/admin", label: "Analítica" },
  { href: "/admin/approvals", label: "Aprobaciones" },
  { href: "/admin/properties", label: "Propiedades" },
]

interface AdminProperty {
  id: string
  title: string
  status: string
  price?: number
  monthlyRent?: number
  listingType: string
  promotionTier?: string | null
  createdAt: string
  seller?: { id: string; name: string; email: string }
}

export default function AdminPropertiesPage() {
  const { data } = useAdminAllProperties()
  const promote = usePromoteProperty()
  const properties = (data as { data?: AdminProperty[] })?.data ?? []

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-6">Administración</h1>

        <div className="flex gap-1 mb-8 bg-sand-light/50 p-1 rounded-lg w-fit">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${t.href === "/admin/properties" ? "bg-white text-clay shadow-sm" : "text-ink-light hover:text-ink"}`}>{t.label}</Link>
          ))}
        </div>

        {properties.length === 0 ? (
          <div className="bg-white border border-sand-dark/30 rounded-xl p-12 text-center">
            <p className="text-5xl mb-4">\uD83C\uDFE1</p>
            <h2 className="text-xl font-semibold text-ink mb-1">Sin propiedades</h2>
            <p className="text-ink-muted text-sm">No hay propiedades registradas en el sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-sand-dark/30 rounded-xl">
            <table className="w-full text-sm">
              <thead className="border-b border-sand-dark/20 bg-sand-light/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-ink-light">Título</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-light">Dueño</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-light">Precio</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-light">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-light">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p: AdminProperty) => (
                  <tr key={p.id} className="border-b border-sand-dark/10 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{p.title}</p>
                      <p className="text-xs text-ink-muted">{new Date(p.createdAt).toLocaleDateString("es-MX")}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-light">{p.seller?.name ?? "â€”"}</td>
                    <td className="px-4 py-3 text-ink-light">
                      {p.listingType === "for_rent"
                        ? `$${p.monthlyRent?.toLocaleString()}/mes`
                        : formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === "disponible" ? "bg-green-100 text-green-700" : "bg-sand-light text-ink-muted"
                      }`}>
                        {p.status === "disponible" ? "Activa" : p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <a href={`/properties/${p.id}`} className="text-clay text-xs hover:underline">Ver</a>
                        {!p.promotionTier ? (
                          <button onClick={() => promote.mutate({ id: p.id, promotionTier: "featured" })} className="text-clay text-xs hover:underline">Destacar</button>
                        ) : (
                          <button onClick={() => promote.mutate({ id: p.id, promotionTier: undefined })} className="text-ink-muted text-xs hover:underline">Quitar promo</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
