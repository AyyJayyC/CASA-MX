import { useState } from "react"
import type { Property } from "@/types/property"
import { Button } from "@/components/ui/Button"
import { useSubmitRequest } from "@/lib/queries"

export function ContactOwner({ property }: { property: Property }) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)

  const [loading, setLoading] = useState(false)
  const submitRequest = useSubmitRequest()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await submitRequest.mutateAsync({ propertyId: property.id, name, phone, message: message || undefined })
      setSent(true)
    } catch { /* silently fail */ }
    finally { setLoading(false) }
  }

  const seller = property.seller

  return (
    <div className="bg-white border border-sand-dark/30 rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-ink">
        {property.listingType === "for_sale" ? "Contactar al vendedor" : "Contactar al arrendador"}
      </h2>

      {seller && (
        <div className="flex items-center gap-3 pb-4 border-b border-sand-dark/20">
          <div className="w-10 h-10 rounded-full bg-clay/10 flex items-center justify-center text-clay font-medium">
            {seller.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-ink">{seller.name}</p>
            {seller.agency && <p className="text-xs text-ink-muted">{seller.agency.name}</p>}
          </div>
        </div>
      )}

      {sent ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          Mensaje enviado. El propietario se pondrá en contacto contigo pronto.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-sand-dark/30 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
            required
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-sand-dark/30 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay"
            required
          />
          <textarea
            placeholder="Me interesa esta propiedad..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-sand-dark/30 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay resize-none"
            required
          />
          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Enviar mensaje
          </Button>
        </form>
      )}
    </div>
  )
}
