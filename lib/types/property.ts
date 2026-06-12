export type PropertyType =
  | "Casa"
  | "Departamento"
  | "Terreno"
  | "Oficina"
  | "Local"
  | "Bodega"
  | "Edificio"
  | string;

export type ListingType = "for_sale" | "for_rent";

export type PropertyStatus =
  | "available"
  | "pending"
  | "sold"
  | "rented"
  | "draft";

export interface Property {
  id: string;
  title: string;
  description?: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  currency?: string;
  address: string;
  colonia?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  superficieTerreno?: number;
  superficieConstruccion?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  amenities?: string[];
  images?: PropertyImage[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  order: number;
}

export interface PropertyFilters {
  listingType?: ListingType;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  colonia?: string;
  ciudad?: string;
  estado?: string;
  bedrooms?: number;
  bathrooms?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}
