import {
  formatNumber,
  formatDecimal,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatPercentage,
} from "../../lib/utils/format";

describe("formatNumber", () => {
  it("formats a valid number with es-MX locale", () => {
    expect(formatNumber(1500)).toBe("1,500");
  });
  it("formats large numbers", () => {
    expect(formatNumber(1000000)).toBe("1,000,000");
  });
  it("returns — for null", () => {
    expect(formatNumber(null)).toBe("—");
  });
  it("returns — for undefined", () => {
    expect(formatNumber(undefined)).toBe("—");
  });
  it("returns — for NaN", () => {
    expect(formatNumber(NaN)).toBe("—");
  });
  it("returns — for non-numeric string", () => {
    expect(formatNumber("abc")).toBe("—");
  });
  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
  it("formats negative numbers", () => {
    expect(formatNumber(-1500)).toBe("-1,500");
  });
});

describe("formatDecimal", () => {
  it("formats with 2 decimal places", () => {
    expect(formatDecimal(1500)).toBe("1,500.00");
  });
  it("formats decimals properly", () => {
    expect(formatDecimal(1500.5)).toBe("1,500.50");
  });
  it("returns — for null", () => {
    expect(formatDecimal(null)).toBe("—");
  });
  it("returns — for NaN", () => {
    expect(formatDecimal(NaN)).toBe("—");
  });
});

describe("formatCurrency", () => {
  it("formats with MXN suffix", () => {
    expect(formatCurrency(1500)).toBe("$1,500 MXN");
  });
  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0 MXN");
  });
  it("returns — for null", () => {
    expect(formatCurrency(null)).toBe("—");
  });
  it("returns — for undefined", () => {
    expect(formatCurrency(undefined)).toBe("—");
  });
  it("returns — for NaN", () => {
    expect(formatCurrency(NaN)).toBe("—");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const r = formatDate("2025-06-15");
    expect(r).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
  it("formats ISO 8601", () => {
    expect(formatDate("2025-01-01T12:00:00Z")).toBe("01/01/2025");
  });
  it("returns — for empty string", () => {
    expect(formatDate("")).toBe("—");
  });
  it("returns — for null", () => {
    expect(formatDate(null)).toBe("—");
  });
  it("returns — for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });
  it("returns — for invalid date string", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("formatDateTime", () => {
  it("formats date and time", () => {
    const r = formatDateTime("2025-06-15T14:30:00");
    expect(r).toMatch(/^\d{2}\/\d{2}\/\d{4}/);
    expect(r.length).toBeGreaterThan(10);
  });
  it("returns — for empty", () => {
    expect(formatDateTime("")).toBe("—");
  });
  it("returns — for null", () => {
    expect(formatDateTime(null)).toBe("—");
  });
  it("returns — for invalid", () => {
    expect(formatDateTime("bad")).toBe("—");
  });
});

describe("formatRelativeTime", () => {
  it("returns Ahora for current time", () => {
    const now = new Date();
    expect(formatRelativeTime(now.toISOString())).toBe("Ahora");
  });
  it("returns minutes for <60 min ago", () => {
    const d = new Date(Date.now() - 10 * 60000).toISOString();
    expect(formatRelativeTime(d)).toBe("Hace 10 min");
  });
  it("returns hours for <24h ago", () => {
    const d = new Date(Date.now() - 5 * 3600000).toISOString();
    expect(formatRelativeTime(d)).toBe("Hace 5h");
  });
  it("returns days for <7d ago", () => {
    const d = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(formatRelativeTime(d)).toBe("Hace 3d");
  });
  it("returns formatted date for >7d ago", () => {
    const r = formatRelativeTime("2023-01-15");
    expect(r).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
  it("returns — for empty", () => {
    expect(formatRelativeTime("")).toBe("—");
  });
  it("returns — for null", () => {
    expect(formatRelativeTime(null)).toBe("—");
  });
  it("returns — for invalid", () => {
    expect(formatRelativeTime("bad")).toBe("—");
  });
});

describe("formatPercentage", () => {
  it("formats a percentage", () => {
    expect(formatPercentage(85)).toBe("85%");
  });
  it("rounds to integer", () => {
    expect(formatPercentage(85.6)).toBe("86%");
  });
  it("returns — for null", () => {
    expect(formatPercentage(null)).toBe("—");
  });
  it("returns — for NaN", () => {
    expect(formatPercentage(NaN)).toBe("—");
  });
  it("returns — for undefined", () => {
    expect(formatPercentage(undefined)).toBe("—");
  });
});
