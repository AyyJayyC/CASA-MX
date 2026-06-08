import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Agencies API", () => {
  beforeEach(() => {
    vi.resetModules();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getMyAgency returns agency data on success", async () => {
    const agencyData = { id: "a-1", name: "Mi Agencia", referralCode: "AG001" };
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: agencyData }),
    });

    const { getMyAgency } = await import("../../lib/api/agencies");
    const result = await getMyAgency();
    expect(result).toEqual(agencyData);
  });

  it("getMyAgency returns null when no agency", async () => {
    globalThis.fetch.mockResolvedValue({ ok: false, status: 404 });

    const { getMyAgency } = await import("../../lib/api/agencies");
    const result = await getMyAgency();
    expect(result).toBeNull();
  });

  it("getMyAgency returns null on error", async () => {
    globalThis.fetch.mockRejectedValue(new Error("Network fail"));

    const { getMyAgency } = await import("../../lib/api/agencies");
    const result = await getMyAgency();
    expect(result).toBeNull();
  });

  it("getMyAgents returns agent list on success", async () => {
    const agentsData = [
      { id: "u-1", name: "Juan" },
      { id: "u-2", name: "Maria" },
    ];
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: agentsData }),
    });

    const { getMyAgents } = await import("../../lib/api/agencies");
    const result = await getMyAgents();
    expect(result).toEqual(agentsData);
  });

  it("getMyAgents returns empty array on failure", async () => {
    globalThis.fetch.mockResolvedValue({ ok: false });

    const { getMyAgents } = await import("../../lib/api/agencies");
    const result = await getMyAgents();
    expect(result).toEqual([]);
  });
});
