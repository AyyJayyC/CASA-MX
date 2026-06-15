import { withAuth } from "@/lib/auth-gssp"
import { Layout } from "@/components/layout/Layout"
import { useMyRequests, useSellerRequests, useApproveRequest } from "@/lib/queries"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/Button"

export const getServerSideProps = withAuth()

interface RequestItem {
  id: string
  property?: { id: string; title: string }
  name: string
  phone: string
  message?: string
  createdAt: string
}

export default function RequestsPage() {
  const { data: sentData } = useMyRequests()
  const { data: receivedData } = useSellerRequests()
  const approve = useApproveRequest()
  const [activeTab, setActiveTab] = useState<"sent" | "received">("received")

  const sent = (sentData as { data?: RequestItem[] })?.data ?? []
  const received = (receivedData as { data?: RequestItem[] })?.data ?? []
  const items = activeTab === "received" ? received : sent

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-6">Solicitudes de contacto</h1>

        <div className="flex gap-1 mb-6 bg-sand-light/50 p-1 rounded-lg w-fit">
          <button onClick={() => setActiveTab("received")} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "received" ? "bg-white text-clay shadow-sm" : "text-ink-light"}`}>Recibidas</button>
          <button onClick={() => setActiveTab("sent")} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "sent" ? "bg-white text-clay shadow-sm" : "text-ink-light"}`}>Enviadas</button>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-sand-dark/30 rounded-xl p-12 text-center">
            <p className="text-5xl mb-4">{activeTab === "received" ? "\uD83D\uDCE5" : "\uD83D\uDCE4"}</p>
            <h2 className="text-xl font-semibold text-ink mb-1">Sin solicitudes</h2>
            <p className="text-ink-muted text-sm">{activeTab === "received" ? "No has recibido solicitudes." : "No has enviado solicitudes."}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((r: RequestItem) => (
              <div key={r.id} className="bg-white border border-sand-dark/30 rounded-xl p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-ink">{r.property?.title ?? "Propiedad"}</p>
                    <p className="text-sm text-ink-muted">
                      {r.name} &middot; {r.phone} &middot; {new Date(r.createdAt).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                </div>
                {r.message && <p className="text-sm text-ink-light bg-sand-light/50 rounded-lg p-3 mb-3">{r.message}</p>}
                {activeTab === "received" && (
                  <Button size="sm" variant="secondary" onClick={() => approve.mutate(r.id)}>
                    Compartir dirección
                  </Button>
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
