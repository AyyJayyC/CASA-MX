import { withAuth } from "@/lib/auth-gssp"
import { Layout } from "@/components/layout/Layout"
import { useRouter } from "next/router"
import { useProperty, useCreateProperty } from "@/lib/queries"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export const getServerSideProps = withAuth()

export default function EditPropertyPage() {
  const router = useRouter()
  const { id } = router.query as { id: string }
  const { data, isLoading } = useProperty(id)
  const createProperty = useCreateProperty()
  const property = data?.data
  const [title, setTitle] = useState(property?.title ?? "")
  const [price, setPrice] = useState(property?.price?.toString() ?? "")
  const [description, setDescription] = useState(property?.description ?? "")
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try { await createProperty.mutateAsync({ title, price: Number(price), description }); setSaved(true) } catch {}
  }

  if (isLoading) return <Layout><div className="max-w-2xl mx-auto px-4 py-8"><div className="animate-pulse h-64 bg-sand-light rounded-xl" /></div></Layout>
  if (!property) return <Layout><div className="max-w-2xl mx-auto px-4 py-8 text-center text-ink-muted">Propiedad no encontrada</div></Layout>

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-8">Editar propiedad</h1>
        <form onSubmit={handleSubmit} className="bg-white border border-sand-dark/30 rounded-2xl p-6 space-y-5">
          <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Precio (MXN)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-lg border border-sand-dark/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay" />
          </div>
          <Button type="submit">{saved ? "Guardado" : "Guardar cambios"}</Button>
        </form>
      </div>
    </Layout>
  )
}
