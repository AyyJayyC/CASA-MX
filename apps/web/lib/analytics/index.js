import consoleProvider from "./providers/consoleProvider.js";
import noopProvider from "./providers/noopProvider.js";
import apiProvider from "./providers/apiProvider.js";
import { getItem, setItem } from "../storage/storage.js";

const PROVIDER = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || "console";
const STORAGE_KEY = "analytics.events";
const MAX_EVENTS = 200;

// Internal provider (swappable for tests)
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
  // Read the flag at runtime so tests that change process.env get accurate behavior
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
}

function buildPayload(
  eventName,
  { entityId = null, metadata = {} } = {},
  context = {},
) {
  const timestamp = new Date().toISOString();
  return {
    eventName,
    timestamp,
    userId: context.userId || null,
    activeRole: context.activeRole || null,
    entityId: entityId || null,
    metadata: metadata || {},
  };
}

function readQueue() {
  const q = getItem(STORAGE_KEY);
  return Array.isArray(q) ? q : [];
}

function writeQueue(arr) {
  setItem(STORAGE_KEY, arr.slice(0, MAX_EVENTS));
}

function pushToQueue(payload) {
  const q = readQueue();
  q.unshift(payload);
  if (q.length > MAX_EVENTS) q.length = MAX_EVENTS;
  writeQueue(q);
}

export async function trackEvent(eventName, details = {}, context = {}) {
  if (!isEnabled()) return null;

  const payload = buildPayload(eventName, details, context);

  try {
    // persist a local queue for dashboard use
    pushToQueue(payload);
    // send to provider (async, don't block caller)
    provider.track(payload).catch((err) => {
      console.error("[analytics] provider.track failed:", err);
    });
  } catch (err) {
    console.error("[analytics] trackEvent failed:", err);
  }

  return payload;
}

export function getRecentEvents(limit = 20) {
  const q = readQueue();
  return q.slice(0, limit);
}

export function clearEvents() {
  writeQueue([]);
}

// Test helpers
export function _setProviderForTests(p) {
  provider = p;
}

export default {
  isEnabled,
  trackEvent,
  getRecentEvents,
  clearEvents,
};
