/**
 * API Analytics Provider
 * Sends events to backend at http://localhost:3001/analytics/events
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

module.exports = {
  name: "api",
  track: async (payload) => {
    try {
      const response = await fetch(`${BACKEND_URL}/analytics/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          eventName: payload.eventName,
          ...(payload.entityId ? { entityId: payload.entityId } : {}),
          metadata: {
            ...payload.metadata,
            timestamp: payload.timestamp,
            activeRole: payload.activeRole,
          },
        }),
      });

      if (!response.ok) {
        console.warn("[analytics][api] Track failed:", response.status);
        return { ok: false };
      }

      return { ok: true };
    } catch (err) {
      console.error("[analytics][api] Track error:", err);
      return { ok: false };
    }
  },

  flush: async () => Promise.resolve(),
};
