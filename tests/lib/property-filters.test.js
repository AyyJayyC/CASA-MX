import { describe, it, expect } from "vitest";
import { parsePropertyFilters } from "@/lib/properties/filters";

describe("parsePropertyFilters", () => {
  it("parses URLSearchParams into the backend filter shape", () => {
    const f = parsePropertyFilters(
      new URLSearchParams(
        "type=for_rent&q=casa&estado=Sonora&amenities=Alberca,Gimnasio&minPrice=100&furnished=true&swLat=19.1&swLng=-99.2",
      ),
    );
    expect(f.listingType).toBe("for_rent");
    expect(f.searchQuery).toBe("casa");
    expect(f.estado).toBe("Sonora");
    expect(f.amenities).toBe("Alberca,Gimnasio");
    expect(f.minPrice).toBe("100");
    expect(f.furnished).toBe(true);
    expect(f.swLat).toBe(19.1);
    expect(f.swLng).toBe(-99.2);
  });

  it("accepts a plain Next searchParams object", () => {
    const f = parsePropertyFilters({ type: "for_sale", ciudad: "Hermosillo" });
    expect(f.listingType).toBe("for_sale");
    expect(f.ciudad).toBe("Hermosillo");
  });

  it("defaults to for_sale and suppresses the default rent range", () => {
    const f = parsePropertyFilters({});
    expect(f.listingType).toBe("for_sale");
    expect(f.minRent).toBeUndefined();
    expect(f.maxRent).toBeUndefined();
  });

  it("keeps a custom rent range", () => {
    const f = parsePropertyFilters({ minRent: "8000", maxRent: "20000" });
    expect(f.minRent).toBe("8000");
    expect(f.maxRent).toBe("20000");
  });

  it("ignores non-numeric coordinates", () => {
    const f = parsePropertyFilters({ swLat: "abc" });
    expect(f.swLat).toBeUndefined();
  });
});
