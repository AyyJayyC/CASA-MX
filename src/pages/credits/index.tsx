import { useState } from "react"
import { withAuth } from "@/lib/auth-gssp"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { useCreditBalance, useCreditPackages, useCreatePaymentIntent } from "@/lib/queries"

export const getServerSideProps = withAuth()

export default function CreditsPage() {
  const { data: balance } = useCreditBalance()
  const { data: packagesData } = useCreditPackages()
  const paymentIntent = useCreatePaymentIntent()
  const [selected, setSelected] = useState("p300")
  const [loading, setLoading] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

  const credits = (balance as { balance?: number })?.balance ?? 0
  const packages = (packagesData as { packages?: Array<{ id: string; credits: number; priceMXN: number; name: string }> })?.packages ?? []

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-2">Créditos</h1>
        <p className="text-ink-muted mb-8">
          Los créditos te permiten desbloquear contactos de interesados, promover propiedades y más.
        </p>

        <div className="bg-white border border-sand-dark/30 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider mb-4">Tu balance</h2>
          <p className="text-4xl font-bold text-clay">{credits}</p>
          <p className="text-sm text-ink-muted mt-1">créditos disponibles</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {packages.map((pkg: { id: string; credits: number; priceMXN: number; name: string }) => (
            <button
              key={pkg.id}
              onClick={() => setSelected(pkg.id)}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${selected === pkg.id ? "border-clay bg-clay/5" : "border-sand-dark/30 hover:border-clay/30"}`}
            >
              <p className="text-2xl font-bold text-ink">{pkg.credits}</p>
              <p className="text-xs text-ink-muted mt-0.5">créditos</p>
              <p className="text-lg font-semibold text-clay mt-3">${pkg.priceMXN} MXN</p>
              <p className="text-xs text-ink-muted">{pkg.name}</p>
            </button>
          ))}
        </div>

        <Button
          className="w-full"
          size="lg"
          loading={loading}
          onClick={async () => {
            setLoading(true)
            try {
              const result = await paymentIntent.mutateAsync(selected)
              if ((result as { clientSecret?: string }).clientSecret) {
                setCheckoutUrl((result as { clientSecret?: string }).clientSecret ?? null)
              }
            } catch { /* stripe not configured in dev */ }
            setLoading(false)
          }}
        >
          {checkoutUrl ? "Continuar en Stripe" : "Comprar créditos"}
        </Button>

        <p className="text-xs text-ink-muted text-center mt-4">
          Pago seguro con Stripe. Los créditos no expiran.
        </p>
      </div>
    </Layout>
  )
}
