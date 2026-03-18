/**
 * Zod schema for property upload validation
 * Purpose: Define frontend contract for the property form and enable validation.
 */
import { z } from 'zod';

export const financeOptionsSchema = z.object({
  cash: z.boolean().optional(),
  bankLoan: z.boolean().optional(),
  INFONAVIT: z.boolean().optional(),
  other: z.string().optional()
});

const basePropertySchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  address: z.string().min(5, 'La dirección es requerida'),
  estado: z.string().min(2, 'El estado es requerido'),
  ciudad: z.string().min(2, 'La ciudad es requerida'),
  colonia: z.string().min(2, 'La colonia es requerida'),
  codigoPostal: z.string().optional(),
  propertyType: z.string().min(2, 'El tipo de propiedad es requerido'),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  squareMeters: z.number().min(1, 'Los metros cuadrados deben ser > 0'),
  photos: z.array(z.string()).optional(),
  status: z.enum(['available', 'under_contract', 'sold']).optional(),
  uploadedBy: z.object({ id: z.string(), name: z.string() }).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  listingType: z.enum(['for_sale', 'for_rent']).default('for_sale'),
});

const salePropertySchema = basePropertySchema.extend({
  listingType: z.literal('for_sale'),
  price: z.number().min(1, 'El precio debe ser mayor a 0'),
  financeOptions: financeOptionsSchema.optional(),
  monthlyRent: z.number().optional(),
  securityDeposit: z.number().optional(),
  leaseTermMonths: z.number().optional(),
  availableFrom: z.string().optional(),
  furnished: z.boolean().optional(),
  utilitiesIncluded: z.boolean().optional(),
});

const rentalPropertySchema = basePropertySchema.extend({
  listingType: z.literal('for_rent'),
  price: z.number().optional(),
  monthlyRent: z.number().min(1, 'La renta mensual debe ser mayor a 0'),
  securityDeposit: z.number().optional(),
  leaseTermMonths: z.number().optional(),
  availableFrom: z.string().optional(),
  furnished: z.boolean().optional(),
  utilitiesIncluded: z.boolean().optional(),
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
  photos: [],
  status: 'available',
  financeOptions: { cash: false, bankLoan: false, INFONAVIT: false, other: '' },
  latitude: null,
  longitude: null
};
