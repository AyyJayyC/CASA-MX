import { contactRequestSchema } from "../../lib/validation/contactRequestSchema";

describe("contactRequestSchema", () => {
  it("accepts valid request with name and phone", () => {
    const r = contactRequestSchema.safeParse({
      name: "Juan Perez",
      phone: "5512345678",
    });
    expect(r.success).toBe(true);
  });

  it("accepts phone with +52 prefix", () => {
    const r = contactRequestSchema.safeParse({
      name: "Maria",
      phone: "+525512345678",
    });
    expect(r.success).toBe(true);
  });

  it("accepts phone with 52 prefix (no +)", () => {
    const r = contactRequestSchema.safeParse({
      name: "Carlos",
      phone: "525512345678",
    });
    expect(r.success).toBe(true);
  });

  it("accepts phone with formatting characters (transform before regex)", () => {
    const r = contactRequestSchema.safeParse({
      name: "Ana",
      phone: "55-1234-5678",
    });
    expect(r.success).toBe(true);
  });

  it("strips formatting via transform", () => {
    const r = contactRequestSchema.safeParse({
      name: "Pedro",
      phone: "+52 (55) 1234-5678",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.phone).toBe("525512345678");
  });

  it("includes optional message", () => {
    const r = contactRequestSchema.safeParse({
      name: "Luis",
      phone: "5512345678",
      message: "Me interesa esta propiedad",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.message).toBe("Me interesa esta propiedad");
  });

  it("rejects name shorter than 2 chars", () => {
    const r = contactRequestSchema.safeParse({
      name: "A",
      phone: "5512345678",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing name", () => {
    const r = contactRequestSchema.safeParse({ phone: "5512345678" });
    expect(r.success).toBe(false);
  });

  it("rejects phone shorter than 10 digits", () => {
    const r = contactRequestSchema.safeParse({ name: "Test", phone: "551234" });
    expect(r.success).toBe(false);
  });

  it("rejects non-10-digit phone", () => {
    const r = contactRequestSchema.safeParse({ name: "Test", phone: "123456" });
    expect(r.success).toBe(false);
  });

  it("rejects message over 500 chars", () => {
    const r = contactRequestSchema.safeParse({
      name: "Test",
      phone: "5512345678",
      message: "x".repeat(501),
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty phone", () => {
    const r = contactRequestSchema.safeParse({ name: "Test", phone: "" });
    expect(r.success).toBe(false);
  });
});
