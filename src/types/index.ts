export type Role = "seeker" | "owner" | "realtor" | "admin"

export const ROLE_LABELS: Record<Role, string> = {
  seeker: "Buscador",
  owner: "Propietario",
  realtor: "Agente inmobiliario",
  admin: "Administrador",
}

const BACKEND_TO_ROLE: Record<string, Role> = {
  buyer: "seeker",
  tenant: "seeker",
  seller: "owner",
  landlord: "owner",
  realtor: "realtor",
  admin: "admin",
  wholesaler: "owner",
}

export function mapBackendRole(name: string): Role {
  return BACKEND_TO_ROLE[name] ?? "seeker"
}

export function getActiveRole(roles: { roleName: string; status: string }[]): Role {
  const approved = roles.filter((r) => r.status === "approved")
  const roleNames = approved.map((r) => mapBackendRole(r.roleName))
  if (roleNames.includes("admin")) return "admin"
  if (roleNames.includes("realtor")) return "realtor"
  if (roleNames.includes("owner")) return "owner"
  return "seeker"
}

export interface UserRole {
  roleId: string
  roleName: string
  status: "approved" | "pending" | "denied"
}

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  phone?: string
  bio?: string
  roles: UserRole[]
  activeRole: Role
  emailVerified?: boolean
  officialIdUploaded: boolean
  officialIdVerified: boolean
  officialIdReviewStatus?: string | null
  referralCode?: string | null
}

export interface AuthResponse {
  success: boolean
  token: string
  user: {
    id: string
    email: string
    name: string
    roles: UserRole[]
    officialIdUploaded: boolean
    officialIdVerified: boolean
    officialIdReviewStatus?: string | null
    referralCode?: string | null
  }
}
