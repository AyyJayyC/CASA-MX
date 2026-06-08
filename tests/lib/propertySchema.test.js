import {
  propertySchema,
  financeOptionsSchema,
} from "../../lib/validation/propertySchema";

const validSaleProperty = {
  listingType: "for_sale",
  title: "Hermosa casa en Polanco",
  description: "Casa amplia con jardin y alberca en excelente ubicacion",
  address: "Av. Presidente Masaryk 123",
  estado: "Ciudad de Mexico",
  ciudad: "Ciudad de Mexico",
  colonia: "Polanco",
  propertyType: "Casa",
  bedrooms: 3,
  bathrooms: 2,
  squareMeters: 200,
  price: 5000000,
};

const validRentalProperty = {
  listingType: "for_rent",
  title: "Departamento en Condesa",
  description: "Amplio departamento con vista a la ciudad",
  address: "Av. Amsterdam 456",
  estado: "Ciudad de Mexico",
  ciudad: "Ciudad de Mexico",
  colonia: "Condesa",
  propertyType: "Departamento",
  bedrooms: 2,
  bathrooms: 1,
  squareMeters: 80,
  monthlyRent: 15000,
};

describe("propertySchema", () => {
  describe("for_sale", () => {
    it("accepts valid sale property", () => {
      const r = propertySchema.safeParse(validSaleProperty);
      expect(r.success).toBe(true);
    });

    it("rejects missing title", () => {
      const r = propertySchema.safeParse({ ...validSaleProperty, title: "" });
      expect(r.success).toBe(false);
    });

    it("rejects title too short (<5 chars)", () => {
      const r = propertySchema.safeParse({
        ...validSaleProperty,
        title: "Casa",
      });
      expect(r.success).toBe(false);
    });

    it("rejects missing description", () => {
      const r = propertySchema.safeParse({
        ...validSaleProperty,
        description: "",
      });
      expect(r.success).toBe(false);
    });

    it("rejects missing address", () => {
      const r = propertySchema.safeParse({ ...validSaleProperty, address: "" });
      expect(r.success).toBe(false);
    });

    it("rejects price of 0", () => {
      const r = propertySchema.safeParse({ ...validSaleProperty, price: 0 });
      expect(r.success).toBe(false);
    });

    it("rejects negative price", () => {
      const r = propertySchema.safeParse({ ...validSaleProperty, price: -100 });
      expect(r.success).toBe(false);
    });

    it("rejects invalid propertyType", () => {
      const r = propertySchema.safeParse({
        ...validSaleProperty,
        propertyType: "Castillo",
      });
      expect(r.success).toBe(false);
    });

    it("rejects negative bedrooms", () => {
      const r = propertySchema.safeParse({
        ...validSaleProperty,
        bedrooms: -1,
      });
      expect(r.success).toBe(false);
    });

    it("rejects zero square meters", () => {
      const r = propertySchema.safeParse({
        ...validSaleProperty,
        squareMeters: 0,
      });
      expect(r.success).toBe(false);
    });

    it("accepts optional financeOptions", () => {
      const r = propertySchema.safeParse({
        ...validSaleProperty,
        financeOptions: { cash: true, bankLoan: false },
      });
      expect(r.success).toBe(true);
    });

    it("accepts empty financeOptions", () => {
      const r = propertySchema.safeParse({
        ...validSaleProperty,
        financeOptions: {},
      });
      expect(r.success).toBe(true);
    });
  });

  describe("for_rent", () => {
    it("accepts valid rental property", () => {
      const r = propertySchema.safeParse(validRentalProperty);
      expect(r.success).toBe(true);
    });

    it("rejects missing monthlyRent", () => {
      const r = propertySchema.safeParse({
        ...validRentalProperty,
        monthlyRent: 0,
      });
      expect(r.success).toBe(false);
    });

    it("rejects negative monthlyRent", () => {
      const r = propertySchema.safeParse({
        ...validRentalProperty,
        monthlyRent: -500,
      });
      expect(r.success).toBe(false);
    });

    it("rejects sale property with price=0 as rental (discriminated union)", () => {
      const r = propertySchema.safeParse({
        ...validSaleProperty,
        listingType: "for_rent",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("rejects missing listingType", () => {
      const { listingType, ...rest } = validSaleProperty;
      const r = propertySchema.safeParse(rest);
      expect(r.success).toBe(false);
    });

    it("rejects invalid listingType", () => {
      const r = propertySchema.safeParse({
        ...validSaleProperty,
        listingType: "invalid",
      });
      expect(r.success).toBe(false);
    });

    it("accepts empty string fields as falsy for number coerce", () => {
      const r = propertySchema.safeParse({
        ...validSaleProperty,
        price: "",
        bedrooms: "",
        bathrooms: "",
        squareMeters: "",
      });
      expect(r.success).toBe(false);
    });

    it("defaults visibility to public", () => {
      const r = propertySchema.safeParse(validSaleProperty);
      if (r.success) expect(r.data.visibility).toBe("public");
    });
  });
});

describe("financeOptionsSchema", () => {
  it("accepts valid finance options", () => {
    const r = financeOptionsSchema.safeParse({ cash: true, bankLoan: false });
    expect(r.success).toBe(true);
  });

  it("accepts empty object", () => {
    const r = financeOptionsSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("rejects string instead of boolean", () => {
    const r = financeOptionsSchema.safeParse({ cash: "yes" });
    expect(r.success).toBe(false);
  });
});
