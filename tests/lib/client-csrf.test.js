import { vi } from "vitest";

const state = vi.hoisted(() => ({ token: "" }));

vi.mock("@/lib/api/csrf", () => ({
  getCsrfToken: () => state.token,
}));

vi.mock("@/lib/api/auth", () => ({
  refreshAccessToken: vi.fn(),
}));

import { apiFetch, apiFormData, ensureCsrfToken } from "@/lib/api/client";

const ok = { status: 200, ok: true };
const bootstrapOk = () => {
  state.token = "fresh-token";
  return { status: 204, ok: true };
};

beforeEach(() => {
  vi.clearAllMocks();
  state.token = "";
  globalThis.fetch = vi.fn();
});

describe("CSRF bootstrap", () => {
  it("fetches a token before the first mutation and sends it", async () => {
    globalThis.fetch
      .mockImplementationOnce(async () => bootstrapOk())
      .mockResolvedValueOnce(ok);

    await apiFetch("/properties", { method: "POST", body: { a: 1 } });

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch.mock.calls[0][0]).toContain("/auth/csrf");
    expect(globalThis.fetch.mock.calls[1][1].headers["x-csrf-token"]).toBe(
      "fresh-token",
    );
  });

  it("does not bootstrap on GET", async () => {
    globalThis.fetch.mockResolvedValue(ok);

    await apiFetch("/properties");

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("does not bootstrap when a token cookie already exists", async () => {
    state.token = "existing";
    globalThis.fetch.mockResolvedValue(ok);

    await apiFetch("/properties", { method: "PATCH", body: {} });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch.mock.calls[0][1].headers["x-csrf-token"]).toBe(
      "existing",
    );
  });

  it("deduplicates concurrent bootstrap calls", async () => {
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    globalThis.fetch.mockImplementation(async (url) => {
      if (String(url).includes("/auth/csrf")) {
        await gate;
        return bootstrapOk();
      }
      return ok;
    });

    const first = apiFetch("/a", { method: "POST", body: {} });
    const second = apiFetch("/b", { method: "POST", body: {} });
    release();
    await Promise.all([first, second]);

    const bootstraps = globalThis.fetch.mock.calls.filter(([url]) =>
      String(url).includes("/auth/csrf"),
    );
    expect(bootstraps).toHaveLength(1);
  });

  it("bootstraps before a FormData upload", async () => {
    globalThis.fetch
      .mockImplementationOnce(async () => bootstrapOk())
      .mockResolvedValueOnce(ok);

    await apiFormData("/properties/p1/images", new FormData());

    expect(globalThis.fetch.mock.calls[0][0]).toContain("/auth/csrf");
    expect(globalThis.fetch.mock.calls[1][1].headers["x-csrf-token"]).toBe(
      "fresh-token",
    );
  });

  it("resolve true without a request when the cookie exists", async () => {
    state.token = "existing";
    globalThis.fetch.mockResolvedValue(ok);

    await expect(ensureCsrfToken()).resolves.toBe(true);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
