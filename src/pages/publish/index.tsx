import { useState, useRef } from "react"
import { useRouter } from "next/router"
import { withAuth } from "@/lib/auth-gssp"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useCreateProperty } from "@/lib/queries"

export const getServerSideProps = withAuth()

const PROPERTY_TYPES = ["Casa", "Departamento", "Terreno", "Local comercial", "Oficina", "Bodega"]
const CONDITIONS = ["Nuevo", "Remodelado", "Buen estado", "A remodelar"]
const LISTING_TYPES = [
  { value: "for_sale", label: "En venta" },
  { value: "for_rent", label: "En renta" },
]

export default function PublishPage() {
  const router = useRouter()
  const createProperty = useCreateProperty()
  const [listingType, setListingType] = useState<"for_sale" | "for_rent">("for_sale")
  const [title, setTitle] = useState("")
  const [propertyType, setPropertyType] = useState("Casa")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [monthlyRent, setMonthlyRent] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [squareMeters, setSquareMeters] = useState("")
  const [estado, setEstado] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [colonia, setColonia] = useState("")
  const [address, setAddress] = useState("")
  const [condition, setCondition] = useState("")
  const [petFriendly, setPetFriendly] = useState(false)
  const [furnished, setFurnished] = useState("")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const MAX_SIZE = 10 * 1024 * 1024
    const ALLOWED = ["image/jpeg", "image/png", "image/webp"]
    for (const file of files) {
      if (!ALLOWED.includes(file.type)) { setError(`Formato no permitido: ${file.name}. Solo JPG, PNG, WebP.`); return }
      if (file.size > MAX_SIZE) { setError(`Imagen muy grande: ${file.name}. Máximo 10MB.`); return }
    }
    if (files.length + imageFiles.length > 10) {
      setError("Máximo 10 imágenes")
      return
    }
    setImageFiles((prev) => [...prev, ...files])
    setImagePreviews((prev) => [...prev, ...files.map(URL.createObjectURL)])
  }

  function removeImage(i: number) {
    setImageFiles((prev) => prev.filter((_, j) => j !== i))
    setImagePreviews((prev) => prev.filter((_, j) => j !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const body: Record<string, unknown> = {
        title,
        propertyType: propertyType || undefined,
        description: description || undefined,
        listingType,
        price: listingType === "for_sale" ? Number(price) || undefined : undefined,
        monthlyRent: listingType === "for_rent" ? Number(monthlyRent) || undefined : undefined,
        bedrooms: Number(bedrooms) || undefined,
        bathrooms: Number(bathrooms) || undefined,
        squareMeters: Number(squareMeters) || undefined,
        estado: estado || undefined,
        ciudad: ciudad || undefined,
        colonia: colonia || undefined,
        address: address || undefined,
        condition: condition || undefined,
        petFriendly: petFriendly || undefined,
        furnished: furnished || undefined,
      }
      await createProperty.mutateAsync(body)
      setSuccess(true)
    } catch (err) {
      setError((err as Error).message || "Error al publicar")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-6xl mb-4">\u2705</p>
          <h1 className="text-2xl font-bold text-ink mb-2">Propiedad publicada</h1>
          <p className="text-ink-muted mb-8">Tu propiedad ha sido publicada exitosamente.</p>
          <Button onClick={() => router.push("/dashboard/properties")}>Ir a mis propiedades</Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-8">Publicar propiedad</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-white border border-sand-dark/30 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-ink">Tipo de publicación</h2>
            <div className="grid grid-cols-2 gap-3">
              {LISTING_TYPES.map((lt) => (
                <button
                  key={lt.value}
                  type="button"
                  onClick={() => setListingType(lt.value as typeof listingType)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${listingType === lt.value ? "border-clay bg-clay/5 text-clay" : "border-sand-dark/40 text-ink-light hover:border-clay/30"}`}
                >
                  <p className="text-2xl mb-1">{lt.value === "for_sale" ? "\uD83D\uDCB0" : "\uD83D\uDCC5"}</p>
                  <p className="text-sm font-medium">{lt.label}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-sand-dark/30 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-ink">Imágenes</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {imagePreviews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-sand-light group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {imageFiles.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-sand-dark/50 flex flex-col items-center justify-center text-ink-muted hover:border-clay/50 hover:text-clay transition-colors"
                >
                  <span className="text-2xl">+</span>
                  <span className="text-xs mt-1">Añadir</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
          </section>

          <section className="bg-white border border-sand-dark/30 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-ink">Detalles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Casa en la Condesa" required />
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Tipo de propiedad</label>
                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full rounded-lg border border-sand-dark/30 bg-white px-4 py-2.5 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay">
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Input label="Recámaras" type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="0" />
              <Input label="Baños" type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="0" />
              <Input label="Metros construidos (m²)" type="number" value={squareMeters} onChange={(e) => setSquareMeters(e.target.value)} placeholder="0" />
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Condición</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full rounded-lg border border-sand-dark/30 bg-white px-4 py-2.5 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay">
                  <option value="">Seleccionar</option>
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Input label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe la propiedad..." />
          </section>

          <section className="bg-white border border-sand-dark/30 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-ink">Ubicación</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Ej: Sonora" required />
              <Input label="Ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ej: Hermosillo" />
              <Input label="Colonia" value={colonia} onChange={(e) => setColonia(e.target.value)} placeholder="Ej: Centenario" />
              <Input label="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: Av. Reforma 123" />
            </div>
          </section>

          <section className="bg-white border border-sand-dark/30 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-ink">Precio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listingType === "for_sale" ? (
                <Input label="Precio de venta (MXN)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
              ) : (
                <Input label="Renta mensual (MXN)" type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} placeholder="0" />
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-ink-light">
                <input type="checkbox" checked={petFriendly} onChange={(e) => setPetFriendly(e.target.checked)} className="rounded border-sand-dark/50 text-clay focus:ring-clay" />
                Mascotas permitidas
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm text-ink-light">Amueblado:</label>
                <select value={furnished} onChange={(e) => setFurnished(e.target.value)} className="rounded-lg border border-sand-dark/30 bg-white px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-clay/20">
                  <option value="">No</option>
                  <option value="furnished">Sí</option>
                  <option value="semi_furnished">Semi</option>
                  <option value="equipada">Equipada</option>
                </select>
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Publicar propiedad
          </Button>
        </form>
      </div>
    </Layout>
  )
}
