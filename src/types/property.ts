export interface PropertyImage {
  url: string
  caption?: string
}

export interface PropertyLocation {
  ciudad?: string
  estado: string
  colonia?: string
  codigoPostal?: string
  lat?: number
  lng?: number
}

export interface Property {
  id: string
  title: string
  description?: string
  address?: string
  imageUrls: string[]
  price?: number
  monthlyRent?: number
  listingType: "for_sale" | "for_rent"
  propertyType?: string
  bedrooms?: number
  bathrooms?: number
  halfBaths?: number
  squareMeters?: number
  lotSize?: number
  floors?: number
  yearBuilt?: number
  status: string
  visibility: "public" | "private"
  condition?: string
  furnished?: string
  amenities: string[]
  includedServices: string[]
  financeOptions: string[]
  parkingType?: string
  parkingSpaces?: number
  petFriendly: boolean
  childrenWelcome: boolean
  maintenanceFee?: number
  securityDeposit?: number
  leaseTermMonths?: number
  availableFrom?: string
  utilitiesIncluded: boolean
  lat?: number
  lng?: number
  estado: string
  ciudad?: string
  colonia?: string
  codigoPostal?: string
  mapsUrl?: string
  promotionTier?: "featured" | "carousel" | null
  featuredUntil?: string
  sellerId: string
  seller?: {
    id: string
    name: string
    email: string
    phone?: string
    avatarUrl?: string
    agency?: { name: string } | null
  }
  createdAt: string
  updatedAt: string
}

export interface PropertyFilters {
  listingType?: "for_sale" | "for_rent" | string
  propertyType?: string
  estado?: string
  ciudad?: string
  colonia?: string
  minPrice?: number
  maxPrice?: number
  minRent?: number
  maxRent?: number
  minConstructionMeters?: number
  maxConstructionMeters?: number
  furnished?: string
  petFriendly?: boolean
  swLat?: number
  swLng?: number
  neLat?: number
  neLng?: number
  centerLat?: number
  centerLng?: number
  radiusKm?: number
  limit?: number
  offset?: number
  condition?: string
  amenities?: string[]
  includedServices?: string[]
  financeOptions?: string[]
}

export interface PropertyListResponse {
  success: boolean
  data: Property[]
  total: number
}

export interface PropertyDetailResponse {
  success: boolean
  data: Property
}

export interface MapProperty {
  id: string
  title: string
  address: string
  lat: number
  lng: number
  price?: number
  monthlyRent?: number
  listingType: "for_sale" | "for_rent"
  status: string
  estado: string
  ciudad?: string
  colonia?: string
}

export interface MapPropertyResponse {
  success: boolean
  data: MapProperty[]
  total: number
}

export interface CarouselSlide {
  id: string
  imageUrl: string
  title: string
  subtitle?: string
  link?: string
  buttonText?: string
  order: number
  active: boolean
}

export interface CarouselResponse {
  slides: CarouselSlide[]
}

export interface FilterOptions {
  estados: string[]
  ciudades: Record<string, string[]>
}

export interface Offer {
  id: string
  status: string
  offerAmount?: number
  property?: {
    id: string
    title: string
  }
  createdAt: string
  buyerName?: string
}

export interface OffersResponse {
  offers?: Offer[]
}
