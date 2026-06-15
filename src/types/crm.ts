export const CRM_STATUSES = [
  "nuevo", "contactado", "calificado",
  "negociacion", "propuesta", "cierre", "cerrado",
] as const

export type CRMStatus = (typeof CRM_STATUSES)[number]

export const CRM_STATUS_LABEL: Record<CRMStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  calificado: "Calificado",
  negociacion: "Negociación",
  propuesta: "Propuesta",
  cierre: "Cierre",
  cerrado: "Cerrado",
}

export interface Buyer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  budgetMin?: number | null
  budgetMax?: number | null
  preferredZones: string[]
  propertyType?: string | null
  notes?: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CRMBoardProperty {
  id: string
  title: string
  status: CRMStatus
  buyerId?: string
  buyerName?: string
  price?: number
  monthlyRent?: number
  listingType: "for_sale" | "for_rent"
  imageUrls: string[]
  updatedAt: string
  contacto?: string
  nota?: string
}
