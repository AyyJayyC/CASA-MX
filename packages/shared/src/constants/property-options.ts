// ─── Property constants shared between frontend and backend ───

export const PROPERTY_TYPE_OPTIONS = [
  "Casa",
  "Departamento",
  "Terreno",
  "Local comercial",
  "Oficina",
  "Bodega",
] as const;
export type PropertyType = (typeof PROPERTY_TYPE_OPTIONS)[number];

export const PROPERTY_CONDITION_OPTIONS = [
  "new",
  "remodeled",
  "needs_remodeling",
  "good",
] as const;
export type PropertyCondition = (typeof PROPERTY_CONDITION_OPTIONS)[number];

export const CONDITION_LABELS: Record<PropertyCondition, string> = {
  new: "Nuevo",
  remodeled: "Remodelado",
  needs_remodeling: "Para remodelar",
  good: "Buen estado",
};

export const CONDITION_COLORS: Record<PropertyCondition, string> = {
  new: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  remodeled:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  needs_remodeling:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  good: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
};

export const FURNISHED_OPTIONS = [
  "unfurnished",
  "semi_furnished",
  "furnished",
  "equipada",
] as const;
export type FurnishedOption = (typeof FURNISHED_OPTIONS)[number];

export const FURNISHED_LABELS: Record<FurnishedOption, string> = {
  unfurnished: "Sin amueblar",
  semi_furnished: "Semi amueblado",
  furnished: "Amueblado",
  equipada: "Equipada (solo electrodomésticos)",
};

export const PARKING_TYPE_OPTIONS = [
  "none",
  "garage",
  "driveway",
  "street",
  "covered",
] as const;
export type ParkingType = (typeof PARKING_TYPE_OPTIONS)[number];

export const PARKING_TYPE_LABELS: Record<ParkingType, string> = {
  none: "Sin estacionamiento",
  garage: "Cochera / Garaje",
  driveway: "Entrada para autos",
  street: "Estacionamiento en calle",
  covered: "Estacionamiento techado",
};

export const PROPERTY_STATUS_OPTIONS = [
  "disponible",
  "preventa",
  "en_remodelacion",
  "bajo_promesa",
  "vendido",
  "rentado",
  "retirado",
] as const;
export type PropertyStatus = (typeof PROPERTY_STATUS_OPTIONS)[number];

// Backend-compatible extended statuses (includes English alternatives + pending/incompleto)
export const PROPERTY_STATUS_OPTIONS_EXTENDED = [
  "available",
  "pending",
  "sold",
  "rented",
  "disponible",
  "preventa",
  "en_remodelacion",
  "bajo_promesa",
  "vendido",
  "rentado",
  "retirado",
  "incompleto",
] as const;
export type PropertyStatusExtended =
  (typeof PROPERTY_STATUS_OPTIONS_EXTENDED)[number];

export const STATUS_LABELS: Record<string, string> = {
  disponible: "Disponible",
  available: "Disponible",
  preventa: "Preventa",
  en_remodelacion: "En remodelación",
  bajo_promesa: "Bajo promesa",
  vendido: "Vendido",
  rentado: "Rentado",
  retirado: "Retirado",
  incompleto: "Incompleto",
  pending: "Pendiente",
  sold: "Vendido (EN)",
  rented: "Rentado (EN)",
};

export const STATUS_COLORS: Record<string, string> = {
  disponible:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  available:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  preventa:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  en_remodelacion:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  bajo_promesa:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  vendido: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  rentado: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  retirado:
    "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400",
};

export const VISIBILITY_OPTIONS = ["public", "private"] as const;
export type Visibility = (typeof VISIBILITY_OPTIONS)[number];

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  public: "Público",
  private: "Privado",
};
