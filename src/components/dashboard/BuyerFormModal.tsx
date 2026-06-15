import { useState } from "react"
import { useCreateBuyer, useUpdateBuyer } from "@/lib/queries"
import type { Buyer } from "@/types/crm"

interface Props { buyer: Buyer | null; onClose: () => void }

export function BuyerFormModal({ buyer, onClose }: Props) {
  const createBuyer = useCreateBuyer()
  const updateBuyer = useUpdateBuyer()
  const [name, setName] = useState(buyer?.name ?? "")
  const [email, setEmail] = useState(buyer?.email ?? "")
  const [phone, setPhone] = useState(buyer?.phone ?? "")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const isPending = createBuyer.isPending || updateBuyer.isPending

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "El nombre es requerido"
    if (!email.trim()) e.email = "El email es requerido"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Correo electrónico inválido"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    try {
      if (buyer) {
        await updateBuyer.mutateAsync({ id: buyer.id, name: name.trim(), email: email.trim(), phone: phone?.trim() || undefined })
      } else {
        await createBuyer.mutateAsync({ name: name.trim(), email: email.trim(), phone: phone?.trim() || undefined })
      }
      onClose()
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("Buyer save failed:", err)
      setErrors({ form: "Error al guardar" })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 space-y-4">
        <h3 className="text-lg font-semibold text-ink">{buyer ? "Editar comprador" : "Nuevo comprador"}</h3>

        <div>
          <label htmlFor="buyer-name" className="block text-sm font-medium text-ink mb-1">Nombre</label>
          <input id="buyer-name" aria-label="Nombre" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-sand-dark/30 px-4 py-2 text-sm" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="buyer-email" className="block text-sm font-medium text-ink mb-1">Correo electrónico</label>
          <input id="buyer-email" aria-label="Correo electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-sand-dark/30 px-4 py-2 text-sm" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="buyer-phone" className="block text-sm font-medium text-ink mb-1">Teléfono</label>
          <input id="buyer-phone" aria-label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-sand-dark/30 px-4 py-2 text-sm" />
        </div>

        {errors.form && <p className="text-xs text-red-500">{errors.form}</p>}

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-sand-dark rounded-lg">Cancelar</button>
          <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-clay text-white rounded-lg disabled:opacity-50">
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  )
}
