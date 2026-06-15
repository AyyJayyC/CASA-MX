import { useState } from "react"
import { withAdmin } from "@/lib/auth-admin"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import Link from "next/link"
import { useCarouselSlides, useCreateSlide, useUpdateSlide, useDeleteSlide } from "@/lib/queries"

export const getServerSideProps = withAdmin()

interface Slide {
  id: string
  imageUrl: string
  title: string
  subtitle?: string
  link: string
  buttonText?: string
  order: number
  active: boolean
}

export default function AdminCarouselPage() {
  const { data, isLoading } = useCarouselSlides()
  const createSlide = useCreateSlide()
  const updateSlide = useUpdateSlide()
  const deleteSlide = useDeleteSlide()
  const slides = (data as { slides?: Slide[] })?.slides ?? []

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [link, setLink] = useState("")
  const [buttonText, setButtonText] = useState("")

  function resetForm() {
    setShowForm(false); setEditId(null)
    setImageUrl(""); setTitle(""); setSubtitle(""); setLink(""); setButtonText("")
  }

  function editSlide(s: Slide) {
    setEditId(s.id); setShowForm(true)
    setImageUrl(s.imageUrl); setTitle(s.title); setSubtitle(s.subtitle ?? "")
    setLink(s.link); setButtonText(s.buttonText ?? "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = { imageUrl, title, subtitle: subtitle || undefined, link, buttonText: buttonText || undefined, order: 0 }
    if (editId) await updateSlide.mutateAsync({ id: editId, ...body })
    else await createSlide.mutateAsync(body)
    resetForm()
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-ink">Gestión de Carrusel</h1>
          <Link href="/admin" className="text-sm text-clay hover:text-clay-dark">&larr; Admin</Link>
        </div>

        <div className="mb-6">
          <Button onClick={() => { resetForm(); setShowForm(true) }}>
            + Nuevo slide
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-sand-dark/30 rounded-2xl p-6 mb-6 space-y-4">
            <h3 className="font-semibold text-ink">{editId ? "Editar slide" : "Nuevo slide"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="URL de imagen" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." required />
              <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Input label="Subtítulo (opcional)" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              <Input label="Link del botón" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/properties/..." required />
              <Input label="Texto del botón" value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="Ver más" />
            </div>
            {imageUrl && (
              <div className="h-40 rounded-lg bg-sand-light overflow-hidden">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" size="sm">{editId ? "Guardar" : "Crear"}</Button>
              <Button type="button" size="sm" variant="ghost" onClick={resetForm}>Cancelar</Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-ink-muted">Cargando...</div>
        ) : slides.length === 0 ? (
          <div className="bg-white border border-sand-dark/30 rounded-xl p-12 text-center">
            <p className="text-5xl mb-4">\uD83D\uDDBC\uFE0F</p>
            <h2 className="text-xl font-semibold text-ink mb-1">Sin slides</h2>
            <p className="text-ink-muted text-sm">Crea el primer slide para el carrusel de la página principal.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {slides.map((s: Slide) => (
              <div key={s.id} className="bg-white border border-sand-dark/30 rounded-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-48 h-28 bg-sand-light">
                    <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-ink">{s.title}</p>
                        <button
                          onClick={() => updateSlide.mutate({ id: s.id, active: !s.active })}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.active ? "bg-green-100 text-green-700" : "bg-sand-light text-ink-muted"}`}
                        >
                          {s.active ? "Activo" : "Inactivo"}
                        </button>
                      </div>
                      <p className="text-sm text-ink-muted">{s.link}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => editSlide(s)} className="text-xs text-clay hover:text-clay-dark">Editar</button>
                      <button onClick={() => { if (confirm("Eliminar?")) deleteSlide.mutate(s.id) }} className="text-xs text-red-600 hover:text-red-700">Eliminar</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
