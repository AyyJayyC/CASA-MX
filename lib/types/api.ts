export type OfferStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "countered"
  | "withdrawn"
  | "expired";

export interface Offer {
  id: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency?: string;
  message?: string;
  status: OfferStatus;
  counterOfferAmount?: number;
  counterOfferMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NegotiationMessage {
  id: string;
  offerId: string;
  senderId: string;
  message: string;
  amount?: number;
  isCounterOffer: boolean;
  createdAt: string;
}

export type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface RentalApplication {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  status: ApplicationStatus;
  message?: string;
  moveInDate?: string;
  monthlyIncome?: number;
  occupation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Review {
  id: string;
  propertyId?: string;
  userId: string;
  reviewerId: string;
  rating: number;
  comment?: string;
  role: string;
  createdAt: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  stripePriceId: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
