import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Analytics layer", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends structured payload to provider when enabled", async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = "true";
    const analytics = require("../../lib/analytics");

    const mockProvider = { track: vi.fn().mockResolvedValue({ ok: true }) };
    analytics._setProviderForTests(mockProvider);

    const payload = await analytics.trackEvent(
      "PropertyViewed",
      { entityId: "prop-1", metadata: { foo: "bar" } },
      { userId: "user-1", activeRole: "seller" },
    );

    expect(payload).toBeDefined();
    expect(payload.eventName).toBe("PropertyViewed");
    expect(payload.userId).toBe("user-1");
    expect(mockProvider.track).toHaveBeenCalled();
  });

  it("does not throw when analytics disabled", async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = "false";
    const analytics = require("../../lib/analytics");

    const res = await analytics.trackEvent(
      "TestEvent",
      { entityId: "x" },
      { userId: "u" },
    );
    expect(res).toBeNull();
  });
});
