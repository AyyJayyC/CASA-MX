import { describe, it, expect } from "vitest"
import { CRM_STATUSES, CRM_STATUS_LABEL, type CRMStatus, type Buyer, type CRMBoardProperty } from "@/types/crm"

describe("CRM types", () => {
  it("has 7 statuses", () => {
    expect(CRM_STATUSES).toHaveLength(7)
  })

  it("each status has a Spanish label", () => {
    CRM_STATUSES.forEach((s) => {
      expect(CRM_STATUS_LABEL[s]).toBeTruthy()
      expect(typeof CRM_STATUS_LABEL[s]).toBe("string")
    })
  })

  it("CRM_STATUS_LABEL has correct values", () => {
    expect(CRM_STATUS_LABEL.nuevo).toBe("Nuevo")
    expect(CRM_STATUS_LABEL.negociacion).toBe("Negociación")
    expect(CRM_STATUS_LABEL.cerrado).toBe("Cerrado")
  })

  it("Buyer shape is correct", () => {
    const buyer: Buyer = {
      id: "b-1", name: "Juan Pérez", email: "juan@example.com",
      phone: "555-1234", budget: 2_500_000,
      createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
    }
    expect(buyer.name).toBe("Juan Pérez")
    expect(buyer.budget).toBe(2_500_000)
  })

  it("CRMBoardProperty shape is correct", () => {
    const prop: CRMBoardProperty = {
      id: "p-1", title: "Casa en Polanco", status: "negociacion",
      listingType: "for_sale", price: 3_200_000,
      imageUrls: ["/img.jpg"], updatedAt: "2026-06-01T00:00:00Z",
    }
    expect(prop.title).toBe("Casa en Polanco")
    expect(prop.status).toBe("negociacion")
  })
})
