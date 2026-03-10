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

export const propertySchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.number().min(1, 'El precio debe ser mayor a 0'),
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
  financeOptions: financeOptionsSchema.optional(),
  uploadedBy: z.object({ id: z.string(), name: z.string() }).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional()
});

export const propertyFormDefaults = {
  title: '',
  description: '',
  price: 0,
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
