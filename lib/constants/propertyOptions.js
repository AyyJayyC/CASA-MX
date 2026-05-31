import { PROPERTY_AMENITY_METADATA, RENTAL_SERVICE_METADATA } from './propertyServices';

export const PROPERTY_TYPE_OPTIONS = [
  'Casa',
  'Departamento',
  'Terreno',
  'Local comercial',
  'Oficina',
  'Bodega',
];

export const PROPERTY_CONDITION_OPTIONS = [
  'new',
  'remodeled',
  'needs_remodeling',
  'good',
];

export const CONDITION_LABELS = {
  new: 'Nuevo',
  remodeled: 'Remodelado',
  needs_remodeling: 'Para remodelar',
  good: 'Buen estado',
};

export const CONDITION_COLORS = {
  new: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  remodeled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  needs_remodeling: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  good: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
};

export const FURNISHED_OPTIONS = [
  'unfurnished',
  'semi_furnished',
  'furnished',
];

export const FURNISHED_LABELS = {
  unfurnished: 'Sin amueblar',
  semi_furnished: 'Semi amueblado',
  furnished: 'Amueblado',
};

export const PARKING_TYPE_OPTIONS = [
  'none',
  'garage',
  'driveway',
  'street',
  'covered',
];

export const PARKING_TYPE_LABELS = {
  none: 'Sin estacionamiento',
  garage: 'Cochera / Garaje',
  driveway: 'Entrada para autos',
  street: 'Estacionamiento en calle',
  covered: 'Estacionamiento techado',
};

export const RENTAL_INCLUDED_SERVICE_OPTIONS = [
  ...RENTAL_SERVICE_METADATA.map((service) => service.value),
];

export const PROPERTY_STATUS_OPTIONS = [
  'disponible',
  'preventa',
  'en_remodelacion',
  'bajo_promesa',
  'vendido',
  'rentado',
  'retirado',
];

export const STATUS_LABELS = {
  disponible: 'Disponible',
  available: 'Disponible', // backward compatibility with old DB records
  preventa: 'Preventa',
  en_remodelacion: 'En remodelación',
  bajo_promesa: 'Bajo promesa',
  vendido: 'Vendido',
  rentado: 'Rentado',
  retirado: 'Retirado',
};

export const STATUS_COLORS = {
  disponible: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  preventa: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  en_remodelacion: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  bajo_promesa: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  vendido: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  rentado: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  retirado: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400',
};

export const VISIBILITY_OPTIONS = ['public', 'private'];

export const VISIBILITY_LABELS = {
  public: 'Público',
  private: 'Privado',
};

export const RENTAL_AMENITY_OPTIONS = [
  ...PROPERTY_AMENITY_METADATA.map((amenity) => amenity.value),
];