import { withAuth } from "@/lib/auth-gssp"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useState } from "react"
import Link from "next/link"

export const getServerSideProps = withAuth()

const PLANS = [
  { value: "basico", label: "Básico", agents: 3, price: "$2,499 MXN/mes" },
  { value: "pro", label: "Pro", agents: 10, price: "$5,999 MXN/mes" },
  { value: "empresarial", label: "Empresarial", agents: 25, price: "$9,999 MXN/mes" },
]

export default function AgencyPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState("")
  const [legalName, setLegalName] = useState("")
  const [rfc, setRfc] = useState("")
  const [plan, setPlan] = useState("basico")

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-ink">Agencia</h1>
          <Link href="/settings" className="text-sm text-clay hover:text-clay-dark">&larr; Configuración</Link>
        </div>

        {!showCreate ? (
          <div className="space-y-6">
            <div className="bg-white border border-sand-dark/30 rounded-xl p-12 text-center">
              <p className="text-5xl mb-4">\uD83C\uDFE2</p>
              <h2 className="text-xl font-semibold text-ink mb-1">Sin agencia</h2>
              <p className="text-ink-muted text-sm mb-6">Crea tu agencia inmobiliaria y gestiona múltiples agentes.</p>
              <Button onClick={() => setShowCreate(true)}>Crear agencia</Button>
            </div>

            <div className="bg-white border border-sand-dark/30 rounded-2xl p-6">
              <h3 className="font-semibold text-ink mb-4">Planes disponibles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLANS.map((p) => (
                  <div key={p.value} className="p-4 rounded-xl border border-sand-dark/30 text-center">
                    <p className="font-semibold text-ink">{p.label}</p>
                    <p className="text-sm text-ink-muted mt-1">Hasta {p.agents} agentes</p>
                    <p className="text-lg font-bold text-clay mt-3">{p.price}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-muted mt-4">+ $500 MXN/mes por agente adicional.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-sand-dark/30 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-ink">Crear agencia</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nombre de la agencia" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Bienes Raíces Hermosillo" required />
              <Input label="Razón social" value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder="Ej: BRH S.A. de C.V." />
              <Input label="RFC" value={rfc} onChange={(e) => setRfc(e.target.value)} placeholder="Ej: BRH010101ABC" />
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Plan</label>
                <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full rounded-lg border border-sand-dark/30 bg-white px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay">
                  {PLANS.map((p) => <option key={p.value} value={p.value}>{p.label} — {p.price}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => {/* TODO: POST /agencies */}}>Crear y pagar</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
