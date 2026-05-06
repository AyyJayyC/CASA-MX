import { PROPERTY_AMENITY_METADATA, RENTAL_SERVICE_METADATA } from './propertyServices';

export const PROPERTY_TYPE_OPTIONS = [
  'Casa',
  'Departamento',
  'Terreno',
  'Local comercial',
  'Oficina',
  'Bodega',
];

export const RENTAL_INCLUDED_SERVICE_OPTIONS = [
  ...RENTAL_SERVICE_METADATA.map((service) => service.value),
];

export const RENTAL_AMENITY_OPTIONS = [
  ...PROPERTY_AMENITY_METADATA.map((amenity) => amenity.value),
];