import { CRMStatus, CRM_STATUSES, CRM_STATUS_LABEL, CRMBoardProperty } from "@/types/crm"
import { formatPrice } from "@/lib/format"

interface Props { property: CRMBoardProperty; onStatusChange: (ns: CRMStatus) => void }

export function CRMPropertyCard({ property, onStatusChange }: Props) {
  const price = property.listingType === "for_rent"
    ? `${formatPrice(property.monthlyRent ?? 0)}/mes`
    : formatPrice(property.price ?? 0)

  return (
    <div data-testid="crm-property-card" className="bg-white rounded-lg border border-sand-dark/20 p-3 shadow-sm">
      <div className="flex gap-2">
        {property.imageUrls.length > 0 ? (
          <img src={property.imageUrls[0]} alt={property.title} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
        ) : (
          <div data-testid="image-placeholder" className="w-16 h-16 rounded-md bg-sand-light flex items-center justify-center flex-shrink-0">
            <span className="text-ink-muted text-xs">Sin foto</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">{property.title}</p>
          <p className="text-xs font-semibold text-clay">{price}</p>
          {property.buyerName && <p className="text-xs text-ink-muted truncate">{property.buyerName}</p>}
          {property.contacto && <p className="text-xs text-ink-muted truncate">{property.contacto}</p>}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <select
          value={property.status}
          onChange={(e) => { const ns = e.target.value as CRMStatus; if (ns !== property.status) onStatusChange(ns) }}
          className="text-xs border border-sand-dark/30 rounded-md px-1.5 py-0.5 bg-white"
        >
          {CRM_STATUSES.map((s) => <option key={s} value={s}>{CRM_STATUS_LABEL[s]}</option>)}
        </select>
        <span data-testid="relative-date" className="text-xs text-ink-muted">
          {new Date(property.updatedAt).toLocaleDateString("es-MX")}
        </span>
      </div>
    </div>
  )
}
