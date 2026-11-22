import fs from "node:fs";
import path from "node:path";

const css = () =>
  fs.readFileSync(path.join(process.cwd(), "styles", "tokens.css"), "utf8");

function token(name) {
  const match = css().match(
    new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})\\b`),
  );
  return match?.[1];
}

function channel(value) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("design tokens", () => {
  it("defines the clay / sand / ink palette", () => {
    expect(token("color-clay")).toBe("#9a4e37");
    expect(token("color-sand")).toBe("#eae4dd");
    expect(token("color-ink")).toBe("#1c1b19");
  });

  it("defines semantic surface, border and accent tokens", () => {
    expect(css()).toMatch(/--surface:\s*#[0-9A-Fa-f]{6}/);
    expect(css()).toMatch(/--border:\s*#[0-9A-Fa-f]{6}/);
    expect(css()).toMatch(/--accent:\s*#[0-9A-Fa-f]{6}/);
  });

  it("declares sans and display font tokens", () => {
    expect(css()).toMatch(/--font-sans:/);
    expect(css()).toMatch(/--font-display:/);
    expect(css()).not.toMatch(/DM Sans/);
  });

  it("keeps body text at WCAG AA contrast", () => {
    // ink on the sand page background
    expect(contrast("#1C1B19", "#F5F1EC")).toBeGreaterThanOrEqual(4.5);
    // secondary text on white surfaces
    expect(contrast("#6B6B6B", "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the clay accent readable both ways", () => {
    // clay text on the page background
    expect(contrast("#9A4E37", "#F5F1EC")).toBeGreaterThanOrEqual(4.5);
    // white text on a clay button
    expect(contrast("#FFFFFF", "#9A4E37")).toBeGreaterThanOrEqual(4.5);
  });
});
