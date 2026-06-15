import { withAuth } from "@/lib/auth-gssp"
import { Layout } from "@/components/layout/Layout"
import { useAuth } from "@/hooks/useAuth"
import { useMyOffers, useSellerOffers, useRespondOffer } from "@/lib/queries"
import { ROLE_LABELS } from "@/types"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { formatPrice } from "@/lib/format"

export const getServerSideProps = withAuth()

interface OfferItem {
  id: string
  property?: { id: string; title: string; price?: number }
  offerAmount?: number
  buyerName?: string
  buyerEmail?: string
  status: string
  sellerNote?: string
  createdAt: string
}

export default function OffersPage() {
  const { user } = useAuth()
  const { data: sentData } = useMyOffers()
  const { data: receivedData } = useSellerOffers()
  const respond = useRespondOffer()
  const [activeTab, setActiveTab] = useState<"sent" | "received">("received")
  const [counterOfferId, setCounterOfferId] = useState<string | null>(null)
  const [counterAmount, setCounterAmount] = useState("")

  const sent = (sentData as { offers?: OfferItem[] })?.offers ?? []
  const received = (receivedData as { offers?: OfferItem[] })?.offers ?? []
  const items = activeTab === "received" ? received : sent

  if (!user) return null

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-6">Ofertas</h1>

        <div className="flex gap-1 mb-6 bg-sand-light/50 p-1 rounded-lg w-fit">
          <button onClick={() => setActiveTab("received")} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "received" ? "bg-white text-clay shadow-sm" : "text-ink-light"}`}>Recibidas</button>
          <button onClick={() => setActiveTab("sent")} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "sent" ? "bg-white text-clay shadow-sm" : "text-ink-light"}`}>Enviadas</button>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-sand-dark/30 rounded-xl p-12 text-center">
            <p className="text-5xl mb-4">{activeTab === "received" ? "\uD83D\uDCE5" : "\uD83D\uDCE4"}</p>
            <h2 className="text-xl font-semibold text-ink mb-1">Sin ofertas</h2>
            <p className="text-ink-muted text-sm">{activeTab === "received" ? "No has recibido ofertas." : "No has enviado ofertas aún."}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((offer: OfferItem) => (
              <div key={offer.id} className="bg-white border border-sand-dark/30 rounded-xl p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-ink">
                      {offer.property?.title ?? "Propiedad"}
                    </p>
                    <p className="text-sm text-ink-muted">
                      {offer.buyerName ?? "Comprador"} &middot; {new Date(offer.createdAt).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    offer.status === "accepted" ? "bg-green-100 text-green-700" :
                    offer.status === "rejected" ? "bg-red-100 text-red-700" :
                    offer.status === "countered" ? "bg-yellow-100 text-yellow-700" :
                    "bg-sand-light text-ink-muted"
                  }`}>
                    {offer.status === "pending" ? "Pendiente" :
                     offer.status === "accepted" ? "Aceptada" :
                     offer.status === "rejected" ? "Rechazada" :
                     offer.status === "countered" ? "Contraoferta" : offer.status}
                  </span>
                </div>

                <p className="text-lg font-semibold text-clay mb-3">
                  {formatPrice(offer.offerAmount)}
                </p>

                {offer.sellerNote && (
                  <p className="text-sm text-ink-light bg-sand-light/50 rounded-lg p-3 mb-3">{offer.sellerNote}</p>
                )}

                {activeTab === "received" && offer.status === "pending" && (
                  <>
                    {counterOfferId === offer.id ? (
                      <div className="flex gap-2 items-end mt-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="Monto de contraoferta"
                            value={counterAmount}
                            onChange={(e) => setCounterAmount(e.target.value)}
                            className="w-full rounded-lg border border-sand-dark/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
                          />
                        </div>
                        <Button size="sm" onClick={() => {
                          respond.mutate({ offerId: offer.id, status: "countered", counterAmount: Number(counterAmount) || offer.offerAmount || 0 })
                          setCounterOfferId(null)
                          setCounterAmount("")
                        }}>Enviar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setCounterOfferId(null)}>Cancelar</Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={() => respond.mutate({ offerId: offer.id, status: "accepted" })}>Aceptar</Button>
                        <Button size="sm" variant="secondary" onClick={() => { setCounterOfferId(offer.id); setCounterAmount(String(offer.offerAmount ?? "")) }}>Contraoferta</Button>
                        <Button size="sm" variant="ghost" onClick={() => respond.mutate({ offerId: offer.id, status: "rejected" })}>Rechazar</Button>
                      </div>
                    )}
                  </>
                )}
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
