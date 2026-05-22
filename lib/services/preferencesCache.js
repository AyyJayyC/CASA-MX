const STORAGE_KEY = 'casamx_preferences';

const DEFAULTS = {
  buyer: {
    estados: [],
    ciudades: [],
    propertyTypes: [],
    minPrice: '',
    maxPrice: '',
    minMonthlyRent: '',
    maxMonthlyRent: '',
    conditions: [],
    minConstructionMeters: '',
    maxConstructionMeters: '',
    minLotSize: '',
    maxLotSize: '',
    minBedrooms: '',
    maxBedrooms: '',
    minBathrooms: '',
    maxBathrooms: '',
    petFriendly: false,
    furnished: 'unfurnished',
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
    frequency: 'instant',
    newOffers: true,
    newMessages: true,
  },
  tags: {
    perfil: [],
    enfoque: [],
    operacion: [],
    zona: [],
    actividad: '',
  },
};

export function getPreferences(role = 'buyer') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS.buyer };
    const all = JSON.parse(raw);
    return { ...DEFAULTS.buyer, ...DEFAULTS[role], ...(all[role] || {}) };
  } catch {
    return { ...DEFAULTS.buyer };
  }
}

export function savePreferences(role, prefs) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[role] = { ...DEFAULTS[role], ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return all[role];
  } catch {
    return prefs;
  }
}

export function getNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS.notifications };
    const all = JSON.parse(raw);
    return { ...DEFAULTS.notifications, ...(all.notifications || {}) };
  } catch {
    return { ...DEFAULTS.notifications };
  }
}

export function saveNotifications(notifs) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all.notifications = { ...DEFAULTS.notifications, ...notifs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return all.notifications;
  } catch {
    return notifs;
  }
}

export function getTags() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS.tags };
    const all = JSON.parse(raw);
    return { ...DEFAULTS.tags, ...(all.tags || {}) };
  } catch {
    return { ...DEFAULTS.tags };
  }
}

export function saveTags(tags) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all.tags = { ...DEFAULTS.tags, ...tags };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return all.tags;
  } catch {
    return tags;
  }
}
