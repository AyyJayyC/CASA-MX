import {
  isValidRFC,
  unformatRFC,
  formatRFCForDisplay,
  maskRFCInput,
} from "../../lib/utils/rfcInput";

describe("isValidRFC", () => {
  it("accepts persona fisica RFC (4 letters + 6 digits + 3 chars)", () => {
    expect(isValidRFC("AXRJ940101ABC")).toBe(true);
  });
  it("accepts persona moral RFC (3 letters + 6 digits + 3 chars)", () => {
    expect(isValidRFC("ABC123456XYZ")).toBe(true);
  });
  it("accepts lowercase input", () => {
    expect(isValidRFC("axrj940101abc")).toBe(true);
  });
  it("rejects short string", () => {
    expect(isValidRFC("ABC123")).toBe(false);
  });
  it("rejects missing digits section", () => {
    expect(isValidRFC("ABCDEFGHIJAB")).toBe(false);
  });
  it("rejects empty string", () => {
    expect(isValidRFC("")).toBe(false);
  });
  it("rejects null without crashing", () => {
    expect(isValidRFC(null)).toBe(false);
  });
  it("rejects undefined without crashing", () => {
    expect(isValidRFC(undefined)).toBe(false);
  });
});

describe("unformatRFC", () => {
  it("removes spaces and dashes, uppercases", () => {
    expect(unformatRFC("A X R J - 9 4 0 1 0 1 A B C")).toBe("AXRJ940101ABC");
  });
  it("converts lowercase to uppercase", () => {
    expect(unformatRFC("axrj940101abc")).toBe("AXRJ940101ABC");
  });
  it("returns empty string for null", () => {
    expect(unformatRFC(null)).toBe("");
  });
  it("returns empty string for undefined", () => {
    expect(unformatRFC(undefined)).toBe("");
  });
  it("returns empty string for empty input", () => {
    expect(unformatRFC("")).toBe("");
  });
});

describe("formatRFCForDisplay", () => {
  it("formats persona moral (12 chars)", () => {
    expect(formatRFCForDisplay("ABC123456XYZ")).toBe("ABC123456XYZ");
  });
  it("formats persona fisica (13 chars)", () => {
    expect(formatRFCForDisplay("AXRJ940101ABC")).toBe("AXRJ940101ABC");
  });
  it("handles null without crashing", () => {
    expect(formatRFCForDisplay(null)).toBe("");
  });
  it("handles undefined without crashing", () => {
    expect(formatRFCForDisplay(undefined)).toBe("");
  });
  it("handles empty string", () => {
    expect(formatRFCForDisplay("")).toBe("");
  });
  it("cleans spaces and dashes before formatting", () => {
    expect(formatRFCForDisplay("A X R J - 9 4 0 1 0 1 A B C")).toBe(
      "AXRJ940101ABC",
    );
  });
});

describe("maskRFCInput", () => {
  it("uppercases and limits to 13 chars", () => {
    expect(maskRFCInput("axrj940101abc")).toBe("AXRJ940101ABC");
  });
  it("removes invalid characters", () => {
    expect(maskRFCInput("AX RJ 940101 ABC")).toBe("AXRJ940101ABC");
  });
  it("truncates at 13 characters", () => {
    expect(maskRFCInput("ABCDEFGHIJKLMNOP")).toBe("ABCDEFGHIJKLM");
  });
  it("handles null without crashing", () => {
    expect(maskRFCInput(null)).toBe("");
  });
  it("handles undefined without crashing", () => {
    expect(maskRFCInput(undefined)).toBe("");
  });
  it("handles empty string", () => {
    expect(maskRFCInput("")).toBe("");
  });
});
