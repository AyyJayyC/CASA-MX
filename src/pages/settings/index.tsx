import { useState, useRef } from "react"
import { withAuth } from "@/lib/auth-gssp"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAuth } from "@/hooks/useAuth"
import { useUpdateProfile, useMyTags, useAddTag, useRemoveTag, useUploadAvatar } from "@/lib/queries"

export const getServerSideProps = withAuth()

export default function SettingsPage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateProfile.mutateAsync({ name, phone: phone || undefined })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const MAX_SIZE = 5 * 1024 * 1024
    const ALLOWED = ["image/jpeg", "image/png", "image/webp"]
    if (!ALLOWED.includes(file.type)) {
      setError("Formato no permitido. Solo JPG, PNG o WebP.")
      return
    }
    if (file.size > MAX_SIZE) {
      setError("La imagen debe pesar menos de 5MB.")
      return
    }
    setUploading(true)
    try { await uploadAvatar.mutateAsync(file) }
    catch {}
    finally { setUploading(false) }
  }

  const [error, setError] = useState("")

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-8">Configuración</h1>

        <div className="space-y-8">
          <section className="bg-white border border-sand-dark/30 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Foto de perfil</h2>
            <div className="flex items-center gap-4">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-clay/20" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-clay/10 flex items-center justify-center text-xl font-bold text-clay">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-clay rounded-lg hover:bg-clay-dark transition-colors disabled:opacity-50"
                >
                  {uploading ? "Subiendo..." : "Cambiar foto"}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <p className="text-xs text-ink-muted mt-1">JPG, PNG o WebP. Máx 5MB.</p>
              </div>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="bg-white border border-sand-dark/30 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-ink">Perfil</h2>
              <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Correo electrónico" value={user?.email ?? ""} disabled className="opacity-60" />
              <Input label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52..." />
            </section>

            <div className="flex items-center gap-4">
              <Button type="submit">{saved ? "Guardado \u2714" : "Guardar cambios"}</Button>
              {saved && <span className="text-sm text-green-600">Cambios guardados</span>}
            </div>
          </form>

          <section className="bg-white border border-sand-dark/30 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-ink">Documentos</h2>
            <div className="p-4 bg-sand-light/50 rounded-lg text-center text-sm text-ink-muted">
              Sube tu identificación oficial para verificar tu cuenta.
            </div>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file && process.env.NODE_ENV === "development") console.log("Document selected:", file.name)
                // TODO: wire to document upload mutation (POST /users/me/documents with FormData)
              }}
              className="block w-full text-sm text-ink-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-clay file:text-white hover:file:bg-clay-dark file:transition-colors"
            />
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <TagSubscriptions />
        </div>
      </div>
    </Layout>
  )
}

function TagSubscriptions() {
  const { data } = useMyTags()
  const addTag = useAddTag()
  const removeTag = useRemoveTag()
  const tags = (data as { data?: Array<{ id: string; tagType: string; tagName: string }> })?.data ?? []
  const [newCiudad, setNewCiudad] = useState("")
  const [newColonia, setNewColonia] = useState("")

  return (
    <div className="bg-white border border-sand-dark/30 rounded-2xl p-6 space-y-5">
      <h2 className="text-lg font-semibold text-ink">Suscripciones de ubicación</h2>
      <p className="text-sm text-ink-muted">Recibe notificaciones cuando se publiquen propiedades en tus ubicaciones de interés.</p>

      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t.id} className="inline-flex items-center gap-1 px-3 py-1.5 bg-clay/10 text-clay rounded-full text-sm">
            {t.tagName} ({t.tagType === "ciudad" ? "Ciudad" : "Colonia"})
            <button onClick={() => removeTag.mutate(t.id)} className="ml-1 hover:bg-clay/20 rounded-full p-0.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Agregar ciudad..."
            value={newCiudad}
            onChange={(e) => setNewCiudad(e.target.value)}
            className="flex-1 rounded-lg border border-sand-dark/30 px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
          />
          <button
            onClick={() => { if (newCiudad.trim()) { addTag.mutate({ tagType: "ciudad", tagName: newCiudad.trim() }); setNewCiudad("") } }}
            className="px-3 py-2 text-sm font-medium text-white bg-clay rounded-lg hover:bg-clay-dark disabled:opacity-50"
            disabled={!newCiudad.trim()}
          >
            Agregar
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Agregar colonia..."
            value={newColonia}
            onChange={(e) => setNewColonia(e.target.value)}
            className="flex-1 rounded-lg border border-sand-dark/30 px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
          />
          <button
            onClick={() => { if (newColonia.trim()) { addTag.mutate({ tagType: "colonia", tagName: newColonia.trim() }); setNewColonia("") } }}
            className="px-3 py-2 text-sm font-medium text-white bg-clay rounded-lg hover:bg-clay-dark disabled:opacity-50"
            disabled={!newColonia.trim()}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}
