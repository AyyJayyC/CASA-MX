export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  activeRole: string;
  emailVerified: boolean;
  officialIdUploaded: boolean;
  officialIdVerified: boolean;
  paidSubscriber: boolean;
  subscriptionStatus?: string;
  subscriptionCurrentPeriodEnd?: string;
  roles: UserRole[];
}

export interface UserRole {
  type: "admin" | "buyer" | "seller" | "tenant" | "wholesaler";
  status: "pending" | "approved" | "rejected";
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
  officialIdUploaded: boolean;
  officialIdVerified: boolean;
  paidSubscriber: boolean;
  subscriptionStatus?: string;
  subscriptionCurrentPeriodEnd?: string;
  activeRole: string;
  roles: UserRole[];
}
