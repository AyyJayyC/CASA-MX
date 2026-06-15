import { useState } from "react"
import { useBuyers, useDeleteBuyer } from "@/lib/queries"
import { BuyerFormModal } from "./BuyerFormModal"
import type { Buyer } from "@/types/crm"

export function BuyerManager() {
  const { data, isLoading, isError, error } = useBuyers()
  const buyers = (data as { data?: Buyer[] })?.data ?? []
  const deleteBuyer = useDeleteBuyer()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete() {
    if (!deletingId) return
    setDeleting(true)
    try { await deleteBuyer.mutateAsync(deletingId); setDeletingId(null) }
    catch { console.error("Delete buyer failed") }
    finally { setDeleting(false) }
  }

  if (isLoading) {
    return <div data-testid="buyer-list-skeleton" className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-sand-dark/10 rounded-lg animate-pulse" />)}</div>
  }

  if (isError) {
    return <div className="bg-sand-light/50 rounded-xl p-6 text-center text-sm text-ink-muted">
      <p className="mb-2">\uD83D\uDC64</p>
      <p>La gesti\u00F3n de compradores no est\u00E1 disponible en este momento.</p>
      <p className="text-xs mt-1">Error: {String(error)}</p>
    </div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ink">Compradores</h2>
        <button onClick={() => { setEditingBuyer(null); setModalOpen(true) }} className="px-3 py-1.5 text-sm font-medium bg-clay text-white rounded-lg hover:bg-clay-dark">
          Añadir comprador
        </button>
      </div>

      {buyers.length === 0 ? (
        <p className="text-sm text-ink-muted text-center py-8">No hay compradores registrados</p>
      ) : (
        <div className="space-y-2">
          {buyers.map((b) => (
            <div key={b.id} className="flex items-center justify-between bg-white border border-sand-dark/20 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-ink">{b.name}</p>
                <p className="text-xs text-ink-muted">{b.email}</p>
                {b.phone && <p className="text-xs text-ink-muted">{b.phone}</p>}
                {b.budgetMin && b.budgetMax && (
                  <p className="text-xs text-ink-muted">${b.budgetMin?.toLocaleString()} - ${b.budgetMax?.toLocaleString()}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingBuyer(b); setModalOpen(true) }} className="text-xs text-clay hover:underline" aria-label="Editar">Editar</button>
                <button onClick={() => setDeletingId(b.id)} className="text-xs text-red-500 hover:underline" aria-label="Eliminar">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm">
            <p className="text-sm mb-4">¿Eliminar este comprador?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeletingId(null)} className="px-3 py-1 text-sm border rounded-lg">Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg disabled:opacity-50">
                {deleting ? "Eliminando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && <BuyerFormModal buyer={editingBuyer} onClose={() => { setModalOpen(false); setEditingBuyer(null) }} />}
    </div>
  )
}
