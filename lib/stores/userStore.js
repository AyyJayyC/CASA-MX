import { create } from "zustand";
import { logger } from "../logging/logger";

const DEFAULTS = {
  buyer: {
    estados: [],
    ciudades: [],
    propertyTypes: [],
    minPrice: "",
    maxPrice: "",
    minMonthlyRent: "",
    maxMonthlyRent: "",
    conditions: [],
    minConstructionMeters: "",
    maxConstructionMeters: "",
    minLotSize: "",
    maxLotSize: "",
    petFriendly: false,
    furnished: "unfurnished",
    amenities: [],
    financing: [],
  },
  seller: {
    estados: [],
    ciudades: [],
    propertyTypes: [],
  },
  notifications: {
    newProperties: true,
    frequency: "instant",
    newOffers: true,
    newMessages: true,
  },
  tags: {
    perfil: [],
    enfoque: [],
    operacion: [],
    zona: [],
    actividad: "",
  },
};

const MAX_ADDRESSES = 50;

function normalizeAddress(address) {
  if (!address) return null;
  return {
    estado: (address.estado || "").trim().toLowerCase(),
    ciudad: (address.ciudad || "").trim().toLowerCase(),
    colonia: (address.colonia || "").trim().toLowerCase(),
    codigoPostal: (address.codigoPostal || "").trim(),
  };
}

function loadFromStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    logger.logError(err, `Failed to save ${key} to storage`);
  }
}

export const useUserStore = create((set, get) => ({
  preferences: loadFromStorage("casamx_preferences", {}),
  notifications: loadFromStorage("casamx_preferences", {}),
  addresses: loadFromStorage("casamx_address_history", []),

  getPreferences: (role = "buyer") => {
    const all = get().preferences;
    return { ...DEFAULTS.buyer, ...DEFAULTS[role], ...(all[role] || {}) };
  },

  savePreferences: (role, prefs) => {
    const current = get().preferences;
    const updated = { ...current, [role]: { ...DEFAULTS[role], ...prefs } };
    saveToStorage("casamx_preferences", updated);
    set({ preferences: updated });
    return updated[role];
  },

  getNotifications: () => {
    const all = get().preferences;
    return { ...DEFAULTS.notifications, ...(all.notifications || {}) };
  },

  saveNotifications: (notifs) => {
    const current = get().preferences;
    const updated = { ...current, notifications: { ...DEFAULTS.notifications, ...notifs } };
    saveToStorage("casamx_preferences", updated);
    set({ preferences: updated });
    return updated.notifications;
  },

  getTags: () => {
    const all = get().preferences;
    return { ...DEFAULTS.tags, ...(all.tags || {}) };
  },

  saveTags: (tags) => {
    const current = get().preferences;
    const updated = { ...current, tags: { ...DEFAULTS.tags, ...tags } };
    saveToStorage("casamx_preferences", updated);
    set({ preferences: updated });
    return updated.tags;
  },

  addAddress: (address) => {
    if (!address) return;
    const normalized = normalizeAddress(address);
    let cache = get().addresses.filter((addr) => {
      const nc = normalizeAddress(addr);
      return !(
        nc.estado === normalized.estado &&
        nc.ciudad === normalized.ciudad &&
        nc.colonia === normalized.colonia
      );
    });
    cache.unshift(address);
    if (cache.length > MAX_ADDRESSES) cache = cache.slice(0, MAX_ADDRESSES);
    saveToStorage("casamx_address_history", cache);
    set({ addresses: cache });
  },

  getRecentAddresses: (limit = 5) => {
    return get().addresses.slice(0, limit);
  },

  searchAddresses: (query = "", field = "ciudad") => {
    if (!query) return get().addresses.slice(0, 10);
    const normalized = query.toLowerCase().trim();
    return get()
      .addresses.filter((addr) => {
        const val = (addr[field] || "").toLowerCase();
        return val.includes(normalized);
      })
      .slice(0, 10);
  },

  clearAddresses: () => {
    saveToStorage("casamx_address_history", []);
    set({ addresses: [] });
  },

  clearAll: () => {
    saveToStorage("casamx_preferences", {});
    saveToStorage("casamx_address_history", []);
    set({ preferences: {}, addresses: [] });
  },
}));
