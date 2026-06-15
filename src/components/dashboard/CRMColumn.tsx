import { type CRMStatus, type CRMBoardProperty, CRM_STATUS_LABEL } from "@/types/crm"
import { CRMPropertyCard } from "./CRMPropertyCard"

interface CRMColumnProps {
  status: CRMStatus
  properties: CRMBoardProperty[]
  onStatusChange: (propertyId: string, newStatus: CRMStatus) => void
  loading?: boolean
  error?: string | null
}

export function CRMColumn({ status, properties, onStatusChange, loading = false, error = null }: CRMColumnProps) {
  return (
    <div className="flex-shrink-0 w-72 bg-sand-light/30 rounded-xl border border-sand-dark/20 p-3 flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-ink">{CRM_STATUS_LABEL[status]}</h3>
        <span className="text-xs bg-clay/10 text-clay px-2 py-0.5 rounded-full font-medium">{properties.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 min-h-[100px]">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} data-testid="skeleton-card" className="h-24 bg-sand-dark/10 rounded-lg animate-pulse" />
          ))
        ) : error ? (
          <p className="text-xs text-red-500 text-center py-4">{error}</p>
        ) : properties.length === 0 ? (
          <p className="text-xs text-ink-muted text-center py-8 italic">Sin propiedades</p>
        ) : (
          properties.map((prop) => (
            <CRMPropertyCard key={prop.id} property={prop} onStatusChange={(ns) => onStatusChange(prop.id, ns)} />
          ))
        )}
      </div>
    </div>
  )
}
