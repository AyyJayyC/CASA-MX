import { useRouter } from "next/router"
import { Layout } from "@/components/layout/Layout"

export default function RealtorProfilePage() {
  const router = useRouter()
  const { id } = router.query

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white border border-sand-dark/30 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-clay/10 flex items-center justify-center text-2xl font-bold text-clay">
              R
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink">Agente profesional</h1>
              <p className="text-ink-muted text-sm">Agente #{id}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-sand-light/50 rounded-xl p-4 text-sm text-ink-muted text-center">
              Propiedades publicadas
              <p className="text-2xl font-bold text-ink mt-1">0</p>
            </div>
            <div className="bg-sand-light/50 rounded-xl p-4 text-sm text-ink-muted text-center">
              Años de experiencia
              <p className="text-2xl font-bold text-ink mt-1">--</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
