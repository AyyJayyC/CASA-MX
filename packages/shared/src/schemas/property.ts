// ─── Shared Zod property schemas ───
// Exports both backend API schemas (English errors) and frontend form schema (Spanish errors)

import { z } from "zod";
import {
  PROPERTY_TYPE_OPTIONS,
  PROPERTY_CONDITION_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
  PROPERTY_STATUS_OPTIONS_EXTENDED,
  VISIBILITY_OPTIONS,
  FURNISHED_OPTIONS,
  PARKING_TYPE_OPTIONS,
  type PropertyType,
  type PropertyStatus,
  type PropertyStatusExtended,
  type Visibility,
  type FurnishedOption,
  type ParkingType,
  type PropertyCondition,
} from "../constants/property-options";
import {
  RENTAL_INCLUDED_SERVICE_OPTIONS,
  RENTAL_AMENITY_OPTIONS,
} from "../constants/property-services";
import { FINANCING_VALUES } from "../constants/financing";

// ─── Helpers ───

export function numberInput(schema: z.ZodNumber) {
  return z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    if (typeof value === "number" && Number.isNaN(value)) return undefined;
    return value;
  }, schema);
}

export function optionalNumberInput(schema: z.ZodNumber) {
  return z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    if (typeof value === "number" && Number.isNaN(value)) return undefined;
    return value;
  }, schema.optional());
}

// ─── Shared sub-schemas ───

export const imageUrlSchema = z
  .string()
  .max(2_000_000, "Each image payload must be <= 2MB of text data")
  .refine(
    (value) =>
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:image/"),
    "Image must be an http(s) URL or data:image payload",
  );

export const imageUrlsSchema = z
  .array(imageUrlSchema)
  .max(10, "Maximum 10 images allowed");

export const includedServicesSchema = z
  .array(z.enum(RENTAL_INCLUDED_SERVICE_OPTIONS as [string, ...string[]]))
  .max(RENTAL_INCLUDED_SERVICE_OPTIONS.length);

export const amenitiesSchema = z
  .array(z.enum(RENTAL_AMENITY_OPTIONS as [string, ...string[]]))
  .max(RENTAL_AMENITY_OPTIONS.length);

export const financeOptionsArraySchema = z
  .array(z.enum(FINANCING_VALUES))
  .optional();

export const financeOptionsObjectSchema = z.object({
  cash: z.boolean().optional(),
  bankLoan: z.boolean().optional(),
  INFONAVIT: z.boolean().optional(),
  FOVISSSTE: z.boolean().optional(),
  paymentPlan: z.boolean().optional(),
  other: z.boolean().optional(),
});

// ─── Backend API schemas (English errors) ───

const apiBasePropertySchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(5000, "Description is too long").optional(),
  address: z.string().max(500, "Address is too long").optional(),
  imageUrls: imageUrlsSchema.optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  estado: z
    .string()
    .min(1, "Estado is required")
    .max(100, "Estado is too long"),
  ciudad: z.string().max(100, "Ciudad is too long").optional(),
  colonia: z.string().max(100, "Colonia is too long").optional(),
  codigoPostal: z.string().max(10, "Postal code is too long").optional(),
  propertyType: z.enum(PROPERTY_TYPE_OPTIONS).optional(),
  bedrooms: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().int().min(0).max(50).optional(),
  squareMeters: z
    .number()
    .int()
    .positive("Square meters must be positive")
    .max(1000000)
    .optional(),
  condition: z.string().max(50).optional(),
  parkingType: z.string().max(30).optional(),
  parkingSpaces: z.number().int().min(0).max(100).optional(),
  miniSplits: z.number().int().min(0).max(100).optional(),
  petFriendly: z.boolean().optional(),
  petFee: z.number().min(0).optional(),
  petDeposit: z.number().min(0).optional(),
  yearBuilt: z.number().int().min(1800).max(2027).optional(),
  floors: z.number().int().min(0).max(100).optional(),
  lotSize: z.number().int().min(0).max(10000000).optional(),
  maintenanceFee: z.number().min(0).optional(),
  halfBaths: z.number().int().min(0).max(20).optional(),
  childrenWelcome: z.boolean().optional(),
  issuesInvoice: z.boolean().optional(),
  visibility: z.enum(["public", "private"]).default("public"),
  status: z.enum(PROPERTY_STATUS_OPTIONS_EXTENDED).default("disponible"),
  listingType: z.enum(["for_sale", "for_rent"]).default("for_sale"),
});

export const createSalePropertySchema = apiBasePropertySchema.extend({
  listingType: z.literal("for_sale"),
  price: z
    .number()
    .positive("Price must be positive")
    .max(999999999, "Price is too high"),
  monthlyRent: z.number().optional(),
  securityDeposit: z.number().optional(),
  leaseTermMonths: z.number().optional(),
  availableFrom: z.string().optional(),
  furnished: z.enum(FURNISHED_OPTIONS).optional(),
  utilitiesIncluded: z.boolean().optional(),
  includedServices: includedServicesSchema.optional(),
  amenities: amenitiesSchema.optional(),
  financeOptions: financeOptionsArraySchema,
});

export const createRentalPropertySchema = apiBasePropertySchema.extend({
  listingType: z.literal("for_rent"),
  price: z.number().optional(),
  monthlyRent: z
    .number()
    .positive("Monthly rent must be positive")
    .max(999999999, "Rent is too high"),
  securityDeposit: z
    .number()
    .positive("Security deposit must be positive")
    .max(999999999, "Deposit is too high")
    .optional(),
  leaseTermMonths: z
    .number()
    .int()
    .positive("Lease term must be positive")
    .optional(),
  availableFrom: z.string().optional(),
  furnished: z.enum(FURNISHED_OPTIONS).default("unfurnished"),
  utilitiesIncluded: z.boolean().default(false),
  includedServices: includedServicesSchema.optional(),
  amenities: amenitiesSchema.optional(),
  financeOptions: financeOptionsArraySchema,
});

export const createPropertySchema = z.discriminatedUnion("listingType", [
  createSalePropertySchema,
  createRentalPropertySchema,
]);

export const updatePropertySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  address: z.string().max(500).optional(),
  imageUrls: imageUrlsSchema.optional(),
  price: z.number().positive().max(999999999).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  estado: z.string().max(100).optional(),
  ciudad: z.string().max(100).optional(),
  colonia: z.string().max(100).optional(),
  codigoPostal: z.string().max(10).optional(),
  propertyType: z.enum(PROPERTY_TYPE_OPTIONS).optional(),
  bedrooms: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().int().min(0).max(50).optional(),
  squareMeters: z.number().int().positive().max(1000000).optional(),
  condition: z.string().max(50).optional(),
  parkingType: z.string().max(30).optional(),
  parkingSpaces: z.number().int().min(0).max(100).optional(),
  miniSplits: z.number().int().min(0).max(100).optional(),
  petFriendly: z.boolean().optional(),
  petFee: z.number().min(0).max(999999).optional(),
  petDeposit: z.number().min(0).max(999999).optional(),
  yearBuilt: z.number().int().min(1800).max(2027).optional(),
  floors: z.number().int().min(0).max(100).optional(),
  lotSize: z.number().int().min(0).max(10000000).optional(),
  maintenanceFee: z.number().min(0).max(999999).optional(),
  halfBaths: z.number().int().min(0).max(20).optional(),
  childrenWelcome: z.boolean().optional(),
  issuesInvoice: z.boolean().optional(),
  visibility: z.enum(["public", "private"]).optional(),
  status: z.enum(PROPERTY_STATUS_OPTIONS_EXTENDED).optional(),
  listingType: z.enum(["for_sale", "for_rent"]).optional(),
  monthlyRent: z.number().positive().max(999999999).optional(),
  securityDeposit: z.number().positive().max(999999999).optional(),
  leaseTermMonths: z.number().int().positive().max(36).optional(),
  availableFrom: z.string().max(30).optional(),
  furnished: z.enum(FURNISHED_OPTIONS).optional(),
  utilitiesIncluded: z.boolean().optional(),
  includedServices: includedServicesSchema.optional(),
  amenities: amenitiesSchema.optional(),
  financeOptions: financeOptionsArraySchema,
});

export const propertyFilterSchema = z
  .object({
    estado: z.string().optional(),
    ciudad: z.string().optional(),
    colonia: z.string().optional(),
    codigoPostal: z.string().optional(),
    listingType: z.enum(["for_sale", "for_rent"]).optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    minRent: z.coerce.number().positive().optional(),
    maxRent: z.coerce.number().positive().optional(),
    furnished: z
      .enum(["unfurnished", "semi_furnished", "furnished", "equipada"])
      .optional(),
    condition: z.string().optional(),
    status: z.string().optional(),
    visibility: z.string().optional(),
    petFriendly: z.coerce.boolean().optional(),
    minConstructionMeters: z.coerce.number().positive().optional(),
    maxConstructionMeters: z.coerce.number().positive().optional(),
    minLotSize: z.coerce.number().positive().optional(),
    maxLotSize: z.coerce.number().positive().optional(),
    promoted: z.coerce.boolean().optional(),
    limit: z.coerce.number().int().min(1).max(1000).default(20),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .passthrough();

export const promotePropertySchema = z.object({
  tier: z.enum(["featured", "carousel"]),
  days: z.coerce.number().int().min(1).max(90),
});

// ─── Frontend form schema (Spanish errors, with preprocessors) ───

const formBasePropertySchema = z.object({
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(200, "El título es demasiado largo"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(10000, "La descripción es demasiado larga"),
  address: z
    .string()
    .min(5, "La dirección es requerida")
    .max(500, "La dirección es demasiado larga"),
  estado: z
    .string()
    .min(2, "El estado es requerido")
    .max(100, "Estado inválido"),
  ciudad: z
    .string()
    .min(2, "La ciudad es requerida")
    .max(100, "Ciudad inválida"),
  colonia: z
    .string()
    .min(2, "La colonia es requerida")
    .max(100, "Colonia inválida"),
  codigoPostal: z.string().max(10, "Código postal inválido").optional(),
  propertyType: z.enum(PROPERTY_TYPE_OPTIONS, {
    errorMap: () => ({ message: "Selecciona un tipo de propiedad" }),
  }),
  bedrooms: numberInput(
    z
      .number()
      .int()
      .min(0, "Las recámaras no pueden ser negativas")
      .max(50, "Máximo 50 recámaras"),
  ),
  bathrooms: numberInput(
    z
      .number()
      .int()
      .min(0, "Los baños no pueden ser negativos")
      .max(50, "Máximo 50 baños"),
  ),
  squareMeters: numberInput(
    z
      .number()
      .int()
      .min(1, "Los metros cuadrados deben ser > 0")
      .max(1000000, "Metros cuadrados exceden el límite"),
  ),
  parkingSpaces: optionalNumberInput(
    z
      .number()
      .int()
      .min(0, "Los cajones de estacionamiento no pueden ser negativos")
      .max(100, "Máximo 100 cajones"),
  ),
  parkingType: z.enum(PARKING_TYPE_OPTIONS).nullable().optional(),
  halfBaths: optionalNumberInput(
    z.number().int().min(0).max(20, "Máximo 20 medios baños"),
  ),
  miniSplits: optionalNumberInput(
    z
      .number()
      .int()
      .min(0, "Los mini splits no pueden ser negativos")
      .max(100, "Máximo 100 mini splits"),
  ),
  condition: z.enum(PROPERTY_CONDITION_OPTIONS).nullable().optional(),
  yearBuilt: optionalNumberInput(
    z.number().int().min(1800, "Año inválido").max(2027),
  ),
  floors: optionalNumberInput(
    z
      .number()
      .int()
      .min(1, "Los pisos deben ser > 0")
      .max(100, "Máximo 100 pisos"),
  ),
  lotSize: optionalNumberInput(
    z.number().int().min(0).max(10000000, "Terreno excede el límite"),
  ),
  maintenanceFee: optionalNumberInput(
    z.number().min(0, "La cuota no puede ser negativa").max(1000000),
  ),
  furnished: z.enum(FURNISHED_OPTIONS).nullable().optional(),
  petFriendly: z.boolean().optional(),
  petFee: optionalNumberInput(z.number().min(0)),
  petDeposit: optionalNumberInput(z.number().min(0)),
  childrenWelcome: z.boolean().optional(),
  issuesInvoice: z.boolean().optional(),
  photos: z.array(z.string()).optional(),
  status: z.enum(PROPERTY_STATUS_OPTIONS).optional(),
  visibility: z.enum(VISIBILITY_OPTIONS).default("public"),
  uploadedBy: z.object({ id: z.string(), name: z.string() }).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  listingType: z.enum(["for_sale", "for_rent"]).default("for_sale"),
  confirmedPermissions: z.literal(true, {
    errorMap: () => ({
      message:
        "Debes certificar que eres el propietario o tienes autorizacion legal para publicar esta propiedad",
    }),
  }),
});

const formSalePropertySchema = formBasePropertySchema.extend({
  listingType: z.literal("for_sale"),
  price: numberInput(
    z
      .number()
      .min(1, "El precio debe ser mayor a 0")
      .max(999999999, "Precio excede el límite máximo"),
  ),
  financeOptions: financeOptionsObjectSchema.optional(),
  monthlyRent: optionalNumberInput(z.number()),
  securityDeposit: optionalNumberInput(z.number()),
  leaseTermMonths: optionalNumberInput(z.number()),
  availableFrom: z.string().optional(),
  utilitiesIncluded: z.boolean().optional(),
  includedServices: z.array(z.enum(RENTAL_INCLUDED_SERVICE_OPTIONS as [string, ...string[]])).optional(),
  amenities: z.array(z.enum(RENTAL_AMENITY_OPTIONS as [string, ...string[]])).optional(),
});

const formRentalPropertySchema = formBasePropertySchema.extend({
  listingType: z.literal("for_rent"),
  price: optionalNumberInput(z.number()),
  monthlyRent: numberInput(
    z.number().min(1, "La renta mensual debe ser mayor a 0"),
  ),
  securityDeposit: optionalNumberInput(z.number()),
  leaseTermMonths: optionalNumberInput(z.number()),
  availableFrom: z.string().optional(),
  utilitiesIncluded: z.boolean().optional(),
  includedServices: z.array(z.enum(RENTAL_INCLUDED_SERVICE_OPTIONS as [string, ...string[]])).optional(),
  amenities: z.array(z.enum(RENTAL_AMENITY_OPTIONS as [string, ...string[]])).optional(),
  financeOptions: financeOptionsObjectSchema.optional(),
});

export const propertyFormSchema = z.discriminatedUnion("listingType", [
  formSalePropertySchema,
  formRentalPropertySchema,
]);

export const propertyFormDefaults = {
  listingType: "for_sale" as const,
  title: "",
  description: "",
  price: 0,
  monthlyRent: 0,
  securityDeposit: 0,
  leaseTermMonths: 12,
  availableFrom: "",
  utilitiesIncluded: false,
  address: "",
  estado: "",
  ciudad: "",
  colonia: "",
  codigoPostal: "",
  propertyType: "" as PropertyType | "",
  bedrooms: 0,
  bathrooms: 0,
  squareMeters: 0,
  includedServices: [] as string[],
  amenities: [] as string[],
  photos: [] as string[],
  status: "disponible" as PropertyStatus,
  visibility: "public" as Visibility,
  financeOptions: {
    cash: false,
    bankLoan: false,
    INFONAVIT: false,
    FOVISSSTE: false,
    paymentPlan: false,
    other: false,
  },
  latitude: undefined,
  longitude: undefined,
  parkingType: undefined,
  halfBaths: undefined,
  condition: undefined,
  yearBuilt: undefined,
  floors: undefined,
  lotSize: undefined,
  maintenanceFee: undefined,
  furnished: undefined,
  petFriendly: false,
  petFee: undefined,
  petDeposit: undefined,
  childrenWelcome: false,
  issuesInvoice: false,
  confirmedPermissions: false,
};

// ─── Types ───

export type PropertyFilter = z.infer<typeof propertyFilterSchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyFormInput = z.infer<typeof propertyFormSchema>;
