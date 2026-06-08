import consoleProvider from "./providers/consoleProvider.js";
import noopProvider from "./providers/noopProvider.js";
import apiProvider from "./providers/apiProvider.js";

const PROVIDER = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || "console";

let provider = getProvider(PROVIDER);

function getProvider(name) {
  switch (name) {
    case "api":
      return apiProvider;
    case "noop":
      return noopProvider;
    default:
      return consoleProvider;
  }
}

export function isEnabled() {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
}

function buildPayload(eventName, { entityId = null, metadata = {} } = {}, context = {}) {
  return {
    eventName,
    timestamp: new Date().toISOString(),
    userId: context.userId || null,
    activeRole: context.activeRole || null,
    entityId: entityId || null,
    metadata: metadata || {},
  };
}

export async function trackEvent(eventName, details = {}, context = {}) {
  if (!isEnabled()) return null;

  const payload = buildPayload(eventName, details, context);

  try {
    provider.track(payload).catch((err) => {
      console.error("[analytics] provider.track failed:", err);
    });
  } catch (err) {
    console.error("[analytics] trackEvent failed:", err);
  }

  return payload;
}

export function _setProviderForTests(p) {
  provider = p;
}

export default {
  isEnabled,
  trackEvent,
};
