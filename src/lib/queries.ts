import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "./api"
import type {
  PropertyListResponse,
  PropertyDetailResponse,
  MapPropertyResponse,
  CarouselResponse,
  FilterOptions,
  PropertyFilters,
} from "@/types/property"

export function useProperties(filters: PropertyFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value))
        }
      })
      const { data } = await api.get<PropertyListResponse>(`/properties?${params}`)
      return data
    },
    staleTime: 30_000,
    enabled,
  })
}

export function useProperty(id: string, enabled = true) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data } = await api.get<PropertyDetailResponse>(`/properties/${id}`)
      return data
    },
    staleTime: 60_000,
    enabled: enabled && !!id,
  })
}

export function useCarousel() {
  return useQuery({
    queryKey: ["carousel"],
    queryFn: async () => { const { data } = await api.get<CarouselResponse>("/carousel"); return data },
    staleTime: 5 * 60_000,
  })
}

export function useMapProperties() {
  return useQuery({
    queryKey: ["map-properties"],
    queryFn: async () => { const { data } = await api.get<MapPropertyResponse>("/properties/map"); return data },
    staleTime: 60_000,
  })
}

export function useMostViewed(limit = 8) {
  return useQuery({
    queryKey: ["most-viewed", limit],
    queryFn: async () => { const { data } = await api.get<{ properties: import("@/types/property").Property[] }>(`/properties/most-viewed`, { params: { limit } }); return data },
    staleTime: 60_000,
  })
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ["filter-options"],
    queryFn: async () => { const { data } = await api.get<{ success: boolean; data: FilterOptions }>("/properties/filter-options"); return data.data },
    staleTime: 24 * 60 * 60_000,
  })
}

// ─── OFFERS ────────────────────────────────────────────────

export function useMyOffers() {
  return useQuery({
    queryKey: ["my-offers"],
    queryFn: async () => { const { data } = await api.get("/offers/mine"); return data },
  })
}

export function useSellerOffers() {
  return useQuery({
    queryKey: ["seller-offers"],
    queryFn: async () => { const { data } = await api.get("/offers/seller"); return data },
  })
}

export function useMakeOffer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => { const { data } = await api.post(`/properties/${body.propertyId}/offers`, body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-offers"] }),
  })
}

export function useRespondOffer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ offerId, ...body }: { offerId: string; status: string; sellerNote?: string; counterAmount?: number }) => { const { data } = await api.patch(`/offers/${offerId}`, body); return data },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["seller-offers"] }); qc.invalidateQueries({ queryKey: ["my-offers"] }) },
  })
}

// ─── APPLICATIONS ──────────────────────────────────────────

export function useMyApplications() {
  return useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => { const { data } = await api.get("/applications"); return data },
  })
}

export function useCreateApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => { const { data } = await api.post("/applications", body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-applications"] }),
  })
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; status: string }) => { const { data } = await api.patch(`/applications/${id}`, body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-applications"] }),
  })
}

// ─── REQUESTS ──────────────────────────────────────────────

export function useMyRequests() {
  return useQuery({
    queryKey: ["my-requests"],
    queryFn: async () => { const { data } = await api.get("/requests"); return data },
  })
}

export function useSellerRequests() {
  return useQuery({
    queryKey: ["seller-requests"],
    queryFn: async () => { const { data } = await api.get("/requests/seller"); return data },
  })
}

export function useSubmitRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => { const { data } = await api.post("/requests", body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-requests"] }),
  })
}

export function useApproveRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/requests/${id}/approve`); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller-requests"] }),
  })
}

// ─── CREDITS ───────────────────────────────────────────────

export function useCreditBalance() {
  return useQuery({
    queryKey: ["credit-balance"],
    queryFn: async () => { const { data } = await api.get("/credits/balance"); return data },
  })
}

export function useCreditPackages() {
  return useQuery({
    queryKey: ["credit-packages"],
    queryFn: async () => { const { data } = await api.get("/credits/packages"); return data },
  })
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (packageId: string) => { const { data } = await api.post("/credits/payment-intent", { packageId }); return data },
  })
}

export function useSpendCredits() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: { leadId: string; leadType: string }) => { const { data } = await api.post("/credits/spend", body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credit-balance"] }),
  })
}

// ─── PROFILE / SETTINGS ────────────────────────────────────

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => { const { data } = await api.patch("/users/me", body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user"] }),
  })
}

// ─── NOTIFICATIONS ─────────────────────────────────────────

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => { const { data } = await api.get("/notifications"); return data },
    refetchInterval: 30_000,
    staleTime: 15_000,
  })
}

// ─── ADMIN ─────────────────────────────────────────────────

export function useAdminPendingRoles() {
  return useQuery({
    queryKey: ["admin-pending-roles"],
    queryFn: async () => { const { data } = await api.get("/admin/pending-roles"); return data },
  })
}

export function useApproveRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userRoleId: string) => { const { data } = await api.post(`/admin/roles/${userRoleId}/approve`); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pending-roles"] }),
  })
}

export function useDenyRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userRoleId: string) => { const { data } = await api.post(`/admin/roles/${userRoleId}/deny`); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pending-roles"] }),
  })
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [usersRes, propsRes, pendingRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/properties?limit=1"),
        api.get("/admin/pending-roles"),
      ])
      return {
        totalUsers: (usersRes.data as { users?: unknown[] }).users?.length ?? 0,
        totalProperties: (propsRes.data as PropertyListResponse)?.total ?? 0,
        pendingApprovals: (pendingRes.data as { data?: unknown[] }).data?.length ?? 0,
      }
    },
  })
}

export function useAdminAllProperties() {
  return useQuery({
    queryKey: ["admin-all-properties"],
    queryFn: async () => { const { data } = await api.get("/properties?limit=100"); return data },
  })
}

export function usePromoteProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; promotionTier?: string; featuredUntil?: string }) => { const { data } = await api.patch(`/admin/properties/${id}/promote`, body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-all-properties"] }),
  })
}

// ─── CAROUSEL ADMIN ──────────────────────────────────────

export function useCarouselSlides() {
  return useQuery({
    queryKey: ["admin-carousel"],
    queryFn: async () => { const { data } = await api.get("/admin/carousel"); return data },
  })
}

export function useCreateSlide() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => { const { data } = await api.post("/admin/carousel", body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-carousel"] }),
  })
}

export function useUpdateSlide() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) => { const { data } = await api.put(`/admin/carousel/${id}`, body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-carousel"] }),
  })
}

export function useDeleteSlide() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.delete(`/admin/carousel/${id}`); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-carousel"] }),
  })
}

export function useCreateProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await api.post("/properties", body)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] })
    },
  })
}

// ─── TAGS ────────────────────────────────────────────────

export function useMyTags() {
  return useQuery({
    queryKey: ["my-tags"],
    queryFn: async () => { const { data } = await api.get("/users/tags"); return data },
  })
}

export function useAddTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: { tagType: string; tagName: string; estado?: string }) => { const { data } = await api.post("/users/tags", body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-tags"] }),
  })
}

export function useRemoveTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.delete(`/users/tags/${id}`); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-tags"] }),
  })
}

import type { CRMStatus, Buyer } from "@/types/crm"

// ─── CRM PIPELINE ─────────────────────────────────────────

export function useMyProperties() {
  return useQuery({
    queryKey: ["my-properties"],
    queryFn: async () => { const { data } = await api.get<{ data: import("@/types/crm").CRMBoardProperty[] }>("/properties"); return data },
    staleTime: 15_000,
  })
}

export function useUpdatePropertyStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CRMStatus }) => {
      const { data } = await api.patch(`/properties/${id}`, { status })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-properties"] }),
  })
}

export function useBuyers() {
  return useQuery({
    queryKey: ["buyers"],
    queryFn: async () => { const { data } = await api.get<{ data: Buyer[] }>("/buyers"); return data },
    staleTime: 30_000,
  })
}

export function useCreateBuyer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => { const { data } = await api.post("/buyers", body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buyers"] }),
  })
}

export function useUpdateBuyer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) => { const { data } = await api.patch(`/buyers/${id}`, body); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buyers"] }),
  })
}

export function useDeleteBuyer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.delete(`/buyers/${id}`); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buyers"] }),
  })
}

// ─── NOTIFICATION BELL ────────────────────────────────────
// Unread count is computed client-side from the main notifications query
// (no separate /unread-count endpoint exists on backend)

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => { const { data } = await api.patch("/notifications/read-all"); return data },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useUploadAvatar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      const { data } = await api.post("/users/me/avatar", formData)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user"] }),
  })
}
