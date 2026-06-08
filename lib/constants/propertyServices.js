export const RENTAL_SERVICE_METADATA = [
  { value: "Luz", label: "Luz (Electricidad)", emoji: "💡" },
  { value: "Agua", label: "Agua", emoji: "💧" },
  { value: "Gas", label: "Gas", emoji: "🔥" },
  { value: "Internet", label: "Internet", emoji: "📡" },
  { value: "Estacionamiento", label: "Estacionamiento", emoji: "🅿️" },
  { value: "TV por Cable", label: "TV por Cable", emoji: "📺" },
  { value: "Teléfono", label: "Teléfono", emoji: "☎️" },
  { value: "Vigilancia", label: "Vigilancia", emoji: "🔒" },
];

export const PROPERTY_AMENITY_CATEGORIES = [
  {
    id: "kitchen",
    label: "Cocina",
    emoji: "🍽️",
    items: [
      { value: "Refrigerador", label: "Refrigerador", emoji: "🧊" },
      { value: "Estufa", label: "Estufa", emoji: "🍳" },
      { value: "Microondas", label: "Microondas", emoji: "🌊" },
      { value: "Cocina integral", label: "Cocina integral", emoji: "🏠" },
    ],
  },
  {
    id: "climate",
    label: "Clima",
    emoji: "🌤️",
    items: [
      { value: "Aire acondicionado", label: "Aire acondicionado", emoji: "❄️" },
      { value: "Aire central", label: "Aire central", emoji: "🌀" },
      { value: "Calefacción", label: "Calefacción", emoji: "🔥" },
      { value: "Mini splits", label: "Mini splits", emoji: "🌬️" },
    ],
  },
  {
    id: "laundry",
    label: "Lavandería",
    emoji: "🧺",
    items: [
      { value: "Lavadora", label: "Lavadora", emoji: "🧺" },
      { value: "Secadora", label: "Secadora", emoji: "👖" },
    ],
  },
  {
    id: "outdoor",
    label: "Exterior",
    emoji: "🌿",
    items: [
      { value: "Balcón", label: "Balcón", emoji: "🏘️" },
      { value: "Terraza", label: "Terraza", emoji: "🏖️" },
      { value: "Jardín", label: "Jardín", emoji: "🌳" },
      { value: "Patio", label: "Patio", emoji: "🌤️" },
      { value: "Piscina privada", label: "Piscina privada", emoji: "🏊‍♂️" },
      { value: "Piscina común", label: "Piscina común", emoji: "🏊" },
    ],
  },
  {
    id: "building",
    label: "Edificio",
    emoji: "🏢",
    items: [
      { value: "Gimnasio", label: "Gimnasio", emoji: "💪" },
      { value: "Salón de eventos", label: "Salón de eventos", emoji: "🎉" },
      { value: "Seguridad 24h", label: "Seguridad 24h", emoji: "🚨" },
      { value: "Alberca", label: "Alberca", emoji: "🏊" },
      { value: "Acceso controlado", label: "Acceso controlado", emoji: "🔐" },
      { value: "Elevador", label: "Elevador", emoji: "⬆️" },
    ],
  },
  {
    id: "furniture",
    label: "Mobiliario",
    emoji: "🛋️",
    items: [
      { value: "Closet grande", label: "Closet grande", emoji: "🚪" },
      { value: "Walk-in closet", label: "Walk-in closet", emoji: "🚪" },
      { value: "Amueblado", label: "Amueblado", emoji: "🛋️" },
      { value: "Equipado", label: "Equipado", emoji: "🧰" },
    ],
  },
];

export const PROPERTY_AMENITY_METADATA = PROPERTY_AMENITY_CATEGORIES.flatMap(
  (category) =>
    category.items.map((item) => ({
      ...item,
      category: category.id,
      categoryLabel: category.label,
    })),
);

export const SERVICE_LOOKUP = Object.fromEntries(
  RENTAL_SERVICE_METADATA.map((service) => [service.value, service]),
);

export const AMENITY_LOOKUP = Object.fromEntries(
  PROPERTY_AMENITY_METADATA.map((amenity) => [amenity.value, amenity]),
);

export function getServiceMeta(service) {
  return (
    SERVICE_LOOKUP[service] || { value: service, label: service, emoji: "•" }
  );
}

export function getAmenityMeta(amenity) {
  return (
    AMENITY_LOOKUP[amenity] || {
      value: amenity,
      label: amenity,
      emoji: "•",
      category: "other",
      categoryLabel: "Otros",
    }
  );
}

export function groupAmenitiesByCategory(amenities = []) {
  return amenities.reduce((groups, amenity) => {
    const meta = getAmenityMeta(amenity);
    const key = meta.categoryLabel;

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(meta);
    return groups;
  }, {});
}
