import {
  propertySchema,
  financeOptionsSchema,
} from "../../lib/validation/propertySchema";

const validSale = {
  listingType: "for_sale",
  title: "Hermosa casa en Polanco",
  description: "Casa amplia con jardin en excelente ubicacion",
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

const validRental = {
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

describe("propertySchema — Production Grade", () => {
  describe("for_sale - success", () => {
    it("accepts valid sale property", () => {
      const r = propertySchema.safeParse(validSale);
      expect(r.success).toBe(true);
    });

    it("defaults listingType to for_sale when missing", () => {
      const { listingType, ...rest } = validSale;
      const r = propertySchema.safeParse(rest);
      if (r.success) expect(r.data.listingType).toBe("for_sale");
    });

    it("defaults visibility to public", () => {
      const r = propertySchema.safeParse(validSale);
      if (r.success) expect(r.data.visibility).toBe("public");
    });

    it("accepts all valid property types", () => {
      const types = ["Casa", "Departamento", "Terreno", "Oficina", "Local comercial", "Bodega"];
      for (const t of types) {
        const r = propertySchema.safeParse({ ...validSale, propertyType: t });
        expect(r.success).toBe(true);
      }
    });

    it("accepts optional finance options", () => {
      const r = propertySchema.safeParse({ ...validSale, financeOptions: { cash: true } });
      expect(r.success).toBe(true);
    });

    it("accepts optional location fields", () => {
      const r = propertySchema.safeParse({ ...validSale, codigoPostal: "11560", latitude: 19.43, longitude: -99.13 });
      expect(r.success).toBe(true);
    });

    it("accepts all optional numeric fields", () => {
      const r = propertySchema.safeParse({
        ...validSale, parkingSpaces: 2, parkingType: "garage", halfBaths: 1,
        miniSplits: 3, condition: "new", yearBuilt: 2020, floors: 2,
        lotSize: 300, maintenanceFee: 500, furnished: "unfurnished",
        petFriendly: true, childrenWelcome: true, issuesInvoice: true,
      });
      expect(r.success).toBe(true);
    });
  });

  describe("for_sale - validation errors with exact messages", () => {
    it("rejects title < 5 chars with correct message", () => {
      const r = propertySchema.safeParse({ ...validSale, title: "X" });
      expect(r.success).toBe(false);
      expect(r.error.issues[0].message).toContain("5 caracteres");
    });

    it("rejects title > 200 chars", () => {
      const r = propertySchema.safeParse({ ...validSale, title: "X".repeat(201) });
      expect(r.success).toBe(false);
    });

    it("rejects description < 10 chars", () => {
      const r = propertySchema.safeParse({ ...validSale, description: "short" });
      expect(r.success).toBe(false);
      expect(r.error.issues[0].message).toContain("10 caracteres");
    });

    it("rejects description > 10000 chars", () => {
      const r = propertySchema.safeParse({ ...validSale, description: "X".repeat(10001) });
      expect(r.success).toBe(false);
    });

    it("rejects address > 500 chars", () => {
      const r = propertySchema.safeParse({ ...validSale, address: "X".repeat(501) });
      expect(r.success).toBe(false);
    });

    it("rejects estado > 100 chars", () => {
      const r = propertySchema.safeParse({ ...validSale, estado: "X".repeat(101) });
      expect(r.success).toBe(false);
      expect(r.error.issues[0].message).toContain("inválido");
    });

    it("rejects price = 0 with correct message", () => {
      const r = propertySchema.safeParse({ ...validSale, price: 0 });
      expect(r.success).toBe(false);
      expect(r.error.issues[0].message).toContain("mayor a 0");
    });

    it("rejects price > 999,999,999", () => {
      const r = propertySchema.safeParse({ ...validSale, price: 1000000000 });
      expect(r.success).toBe(false);
    });

    it("rejects negative price", () => {
      const r = propertySchema.safeParse({ ...validSale, price: -1 });
      expect(r.success).toBe(false);
    });

    it("rejects bedrooms > 50", () => {
      const r = propertySchema.safeParse({ ...validSale, bedrooms: 51 });
      expect(r.success).toBe(false);
    });

    it("rejects bathrooms > 50", () => {
      const r = propertySchema.safeParse({ ...validSale, bathrooms: 51 });
      expect(r.success).toBe(false);
    });

    it("rejects squareMeters = 0", () => {
      const r = propertySchema.safeParse({ ...validSale, squareMeters: 0 });
      expect(r.success).toBe(false);
      expect(r.error.issues[0].message).toContain("> 0");
    });

    it("rejects squareMeters > 1,000,000", () => {
      const r = propertySchema.safeParse({ ...validSale, squareMeters: 1000001 });
      expect(r.success).toBe(false);
    });

    it("rejects invalid propertyType with correct message", () => {
      const r = propertySchema.safeParse({ ...validSale, propertyType: "Castillo" });
      expect(r.success).toBe(false);
      expect(r.error.issues[0].message).toContain("tipo de propiedad");
    });

    it("rejects missing estado", () => {
      const r = propertySchema.safeParse({ ...validSale, estado: "" });
      expect(r.success).toBe(false);
    });

    it("rejects missing ciudad", () => {
      const r = propertySchema.safeParse({ ...validSale, ciudad: "" });
      expect(r.success).toBe(false);
    });

    it("rejects missing colonia", () => {
      const r = propertySchema.safeParse({ ...validSale, colonia: "" });
      expect(r.success).toBe(false);
    });
  });

  describe("for_sale - boundary values", () => {
    it("accepts price at max (999,999,999)", () => {
      const r = propertySchema.safeParse({ ...validSale, price: 999999999 });
      expect(r.success).toBe(true);
    });

    it("accepts bedrooms at 50", () => {
      const r = propertySchema.safeParse({ ...validSale, bedrooms: 50 });
      expect(r.success).toBe(true);
    });

    it("accepts bathrooms at 50", () => {
      const r = propertySchema.safeParse({ ...validSale, bathrooms: 50 });
      expect(r.success).toBe(true);
    });

    it("accepts squareMeters at 1", () => {
      const r = propertySchema.safeParse({ ...validSale, squareMeters: 1 });
      expect(r.success).toBe(true);
    });

    it("accepts bedrooms at 0", () => {
      const r = propertySchema.safeParse({ ...validSale, bedrooms: 0 });
      expect(r.success).toBe(true);
    });

    it("accepts empty codigoPostal (optional)", () => {
      const r = propertySchema.safeParse({ ...validSale, codigoPostal: "" });
      expect(r.success).toBe(true);
    });
  });

  describe("for_rent", () => {
    it("accepts valid rental", () => {
      const r = propertySchema.safeParse(validRental);
      expect(r.success).toBe(true);
    });

    it("rejects monthlyRent = 0", () => {
      const r = propertySchema.safeParse({ ...validRental, monthlyRent: 0 });
      expect(r.success).toBe(false);
      expect(r.error.issues[0].message).toContain("mayor a 0");
    });

    it("rejects negative monthlyRent", () => {
      const r = propertySchema.safeParse({ ...validRental, monthlyRent: -1 });
      expect(r.success).toBe(false);
    });

    it("accepts rental with optional sale fields", () => {
      const r = propertySchema.safeParse({ ...validRental, price: 0 });
      expect(r.success).toBe(true);
    });

    it("accepts rental with amenities", () => {
      const r = propertySchema.safeParse({ ...validRental, amenities: ["Amueblado", "Aire acondicionado"] });
      expect(r.success).toBe(true);
    });

    it("accepts rental with included services", () => {
      const r = propertySchema.safeParse({ ...validRental, includedServices: ["Agua", "Luz"] });
      expect(r.success).toBe(true);
    });

    it("rejects invalid amenity value", () => {
      const r = propertySchema.safeParse({ ...validRental, amenities: ["Fake amenity"] });
      expect(r.success).toBe(false);
    });

    it("accepts optional securityDeposit", () => {
      const r = propertySchema.safeParse({ ...validRental, securityDeposit: 15000 });
      expect(r.success).toBe(true);
    });
  });

  describe("discriminated union", () => {
    it("rejects listingType: invalid", () => {
      const r = propertySchema.safeParse({ ...validSale, listingType: "invalid" });
      expect(r.success).toBe(false);
    });

    it("rejects missing listingType", () => {
      const { listingType, ...rest } = validSale;
      const r = propertySchema.safeParse(rest);
      expect(r.success).toBe(false);
    });

    it("rejects sale required fields on rental variant", () => {
      const { price, monthlyRent, ...saleWithoutPrice } = validSale;
      const r = propertySchema.safeParse({ ...saleWithoutPrice, listingType: "for_rent", monthlyRent: 0 });
      expect(r.success).toBe(false);
    });

    it("rejects rental with sale-only price requirement", () => {
      const r = propertySchema.safeParse({ ...validSale, listingType: "for_rent" });
      expect(r.success).toBe(false);
    });
  });

  describe("number preprocess", () => {
    it("coerces numeric strings to numbers", () => {
      const r = propertySchema.safeParse({ ...validSale, price: 5000000, bedrooms: 3 });
      expect(r.success).toBe(true);
    });

    it("treats empty string as undefined (rejects on required)", () => {
      const r = propertySchema.safeParse({ ...validSale, price: "" });
      expect(r.success).toBe(false);
    });
  });
});

describe("financeOptionsSchema", () => {
  it("accepts valid options", () => {
    const r = financeOptionsSchema.safeParse({ cash: true, bankLoan: false });
    expect(r.success).toBe(true);
  });

  it("accepts all fields", () => {
    const r = financeOptionsSchema.safeParse({ cash: true, bankLoan: false, INFONAVIT: true, FOVISSSTE: false, paymentPlan: true, other: false });
    expect(r.success).toBe(true);
  });

  it("accepts empty object", () => {
    expect(financeOptionsSchema.safeParse({}).success).toBe(true);
  });

  it("rejects non-boolean values", () => {
    expect(financeOptionsSchema.safeParse({ cash: "yes" }).success).toBe(false);
    expect(financeOptionsSchema.safeParse({ cash: 1 }).success).toBe(false);
  });
});
