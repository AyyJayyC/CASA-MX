/**
 * Zod schema for property upload validation
 * Purpose: Define frontend contract for the property form and enable validation.
 */
import { z } from 'zod';
import {
  PROPERTY_TYPE_OPTIONS,
  RENTAL_AMENITY_OPTIONS,
  RENTAL_INCLUDED_SERVICE_OPTIONS,
} from '../constants/propertyOptions';

export const financeOptionsSchema = z.object({
  cash: z.boolean().optional(),
  bankLoan: z.boolean().optional(),
  INFONAVIT: z.boolean().optional(),
  other: z.string().optional()
});

const numberInput = (schema) =>
  z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'number' && Number.isNaN(value)) {
      return undefined;
    }

    return value;
  }, schema);

const basePropertySchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  address: z.string().min(5, 'La dirección es requerida'),
  estado: z.string().min(2, 'El estado es requerido'),
  ciudad: z.string().min(2, 'La ciudad es requerida'),
  colonia: z.string().min(2, 'La colonia es requerida'),
  codigoPostal: z.string().optional(),
  propertyType: z.enum(PROPERTY_TYPE_OPTIONS, { errorMap: () => ({ message: 'Selecciona un tipo de propiedad' }) }),
  bedrooms: numberInput(z.number().int().min(0, 'Las recámaras no pueden ser negativas')),
  bathrooms: numberInput(z.number().int().min(0, 'Los baños no pueden ser negativos')),
  squareMeters: numberInput(z.number().int().min(1, 'Los metros cuadrados deben ser > 0')),
  photos: z.array(z.string()).optional(),
  status: z.enum(['available', 'under_contract', 'sold']).optional(),
  uploadedBy: z.object({ id: z.string(), name: z.string() }).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  listingType: z.enum(['for_sale', 'for_rent']).default('for_sale'),
});

const salePropertySchema = basePropertySchema.extend({
  listingType: z.literal('for_sale'),
  price: numberInput(z.number().min(1, 'El precio debe ser mayor a 0')),
  financeOptions: financeOptionsSchema.optional(),
  monthlyRent: numberInput(z.number()).optional(),
  securityDeposit: numberInput(z.number()).optional(),
  leaseTermMonths: numberInput(z.number()).optional(),
  availableFrom: z.string().optional(),
  furnished: z.boolean().optional(),
  utilitiesIncluded: z.boolean().optional(),
  includedServices: z.array(z.enum(RENTAL_INCLUDED_SERVICE_OPTIONS)).optional(),
  amenities: z.array(z.enum(RENTAL_AMENITY_OPTIONS)).optional(),
});

const rentalPropertySchema = basePropertySchema.extend({
  listingType: z.literal('for_rent'),
  price: numberInput(z.number()).optional(),
  monthlyRent: numberInput(z.number().min(1, 'La renta mensual debe ser mayor a 0')),
  securityDeposit: numberInput(z.number()).optional(),
  leaseTermMonths: numberInput(z.number()).optional(),
  availableFrom: z.string().optional(),
  furnished: z.boolean().optional(),
  utilitiesIncluded: z.boolean().optional(),
  includedServices: z.array(z.enum(RENTAL_INCLUDED_SERVICE_OPTIONS)).optional(),
  amenities: z.array(z.enum(RENTAL_AMENITY_OPTIONS)).optional(),
  financeOptions: financeOptionsSchema.optional(),
});

export const propertySchema = z.discriminatedUnion('listingType', [
  salePropertySchema,
  rentalPropertySchema,
]);

export const propertyFormDefaults = {
  listingType: 'for_sale',
  title: '',
  description: '',
  price: 0,
  monthlyRent: 0,
  securityDeposit: 0,
  leaseTermMonths: 12,
  availableFrom: '',
  furnished: false,
  utilitiesIncluded: false,
  address: '',
  estado: '',
  ciudad: '',
  colonia: '',
  codigoPostal: '',
  propertyType: '',
  bedrooms: 0,
  bathrooms: 0,
  squareMeters: 0,
  includedServices: [],
  amenities: [],
  photos: [],
  status: 'available',
  financeOptions: { cash: false, bankLoan: false, INFONAVIT: false, other: '' },
  latitude: null,
  longitude: null
};
