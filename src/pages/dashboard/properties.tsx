import { withAuth } from "@/lib/auth-gssp"
import { Layout } from "@/components/layout/Layout"
import { useProperties, usePromoteProperty } from "@/lib/queries"
import { useAuth } from "@/hooks/useAuth"
import { formatPrice } from "@/lib/format"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/Button"

export const getServerSideProps = withAuth()

export default function DashboardPropertiesPage() {
  const { user } = useAuth()
  const { data } = useProperties({ limit: 50 })
  const promote = usePromoteProperty()
  const all = data?.data ?? []
  const mine = all.filter((p) => p.sellerId === user?.id)
  const [promotingId, setPromotingId] = useState<string | null>(null)

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-ink">Mis propiedades</h1>
          <Link href="/publish" className="px-4 py-2 text-sm font-medium text-white bg-clay rounded-lg hover:bg-clay-dark">
            + Publicar
          </Link>
        </div>

        {mine.length === 0 ? (
          <div className="bg-white border border-sand-dark/30 rounded-xl p-12 text-center">
            <p className="text-5xl mb-4">\uD83C\uDFE1</p>
            <h2 className="text-xl font-semibold text-ink mb-1">Sin propiedades</h2>
            <p className="text-ink-muted text-sm">Publica tu primera propiedad para empezar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mine.map((p) => (
              <div key={p.id} className="bg-white border border-sand-dark/30 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-40 h-28 rounded-lg bg-sand-light overflow-hidden flex-shrink-0">
                    {p.imageUrls?.[0] ? (
                      <img src={p.imageUrls[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-sand-dark">\uD83C\uDFE1</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-semibold text-ink">{p.title}</p>
                        <p className="text-sm text-ink-muted">
                          {[p.colonia, p.ciudad, p.estado].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.promotionTier && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-clay/10 text-clay">
                            {p.promotionTier === "carousel" ? "Portada" : "Destacado"}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === "disponible" ? "bg-green-100 text-green-700" : "bg-sand-light text-ink-muted"
                        }`}>
                          {p.status === "disponible" ? "Activa" : p.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-ink-muted mb-3">
                      <span>{formatPrice(p.listingType === "for_rent" ? p.monthlyRent : p.price)}{p.listingType === "for_rent" ? "/mes" : ""}</span>
                      {p.bedrooms != null && <span>{p.bedrooms} recs</span>}
                      {p.bathrooms != null && <span>{p.bathrooms} baños</span>}
                      {p.squareMeters != null && <span>{p.squareMeters}m\u00B2</span>}
                      <span>{p.listingType === "for_rent" ? "Renta" : "Venta"}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link href={`/properties/${p.id}`} className="text-xs text-clay hover:text-clay-dark">Ver</Link>
                      <Link href={`/properties/edit/${p.id}`} className="text-xs text-clay hover:text-clay-dark">Editar</Link>
                      {promotingId === p.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => { promote.mutate({ id: p.id, promotionTier: "featured" }); setPromotingId(null) }}
                            className="text-xs text-clay font-medium hover:text-clay-dark"
                          >
                            Destacar (5 cr)
                          </button>
                          <button
                            onClick={() => { promote.mutate({ id: p.id, promotionTier: "carousel" }); setPromotingId(null) }}
                            className="text-xs text-clay font-medium hover:text-clay-dark"
                          >
                            Portada (10 cr)
                          </button>
                          <button onClick={() => setPromotingId(null)} className="text-xs text-ink-muted hover:text-ink">
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPromotingId(p.id)}
                          className="text-xs font-medium text-clay hover:text-clay-dark"
                        >
                          {p.promotionTier ? "Cambiar promoción" : "Destacar"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link href="/dashboard" className="block mt-6 text-sm text-clay hover:text-clay-dark">&larr; Panel</Link>
      </div>
    </Layout>
  )
}
