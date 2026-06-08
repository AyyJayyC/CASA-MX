/**
 * Zod schema for property upload validation
 * Purpose: Define frontend contract for the property form and enable validation.
 */
import { z } from "zod";
import {
  PROPERTY_TYPE_OPTIONS,
  PROPERTY_CONDITION_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
  VISIBILITY_OPTIONS,
  FURNISHED_OPTIONS,
  PARKING_TYPE_OPTIONS,
  RENTAL_AMENITY_OPTIONS,
  RENTAL_INCLUDED_SERVICE_OPTIONS,
} from "../constants/propertyOptions";

export const financeOptionsSchema = z.object({
  cash: z.boolean().optional(),
  bankLoan: z.boolean().optional(),
  INFONAVIT: z.boolean().optional(),
  FOVISSSTE: z.boolean().optional(),
  paymentPlan: z.boolean().optional(),
  other: z.boolean().optional(),
});

const numberInput = (schema) =>
  z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === "number" && Number.isNaN(value)) {
      return undefined;
    }

    return value;
  }, schema);

const optionalNumberInput = (schema) =>
  z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === "number" && Number.isNaN(value)) {
      return undefined;
    }

    return value;
  }, schema.optional());

const basePropertySchema = z.object({
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
  parkingType: z.enum(PARKING_TYPE_OPTIONS).optional(),
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
  condition: z.enum(PROPERTY_CONDITION_OPTIONS).optional(),
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
  furnished: z.enum(FURNISHED_OPTIONS).optional(),
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
});

const salePropertySchema = basePropertySchema.extend({
  listingType: z.literal("for_sale"),
  price: numberInput(
    z
      .number()
      .min(1, "El precio debe ser mayor a 0")
      .max(999999999, "Precio excede el límite máximo"),
  ),
  financeOptions: financeOptionsSchema.optional(),
  monthlyRent: optionalNumberInput(z.number()),
  securityDeposit: optionalNumberInput(z.number()),
  leaseTermMonths: optionalNumberInput(z.number()),
  availableFrom: z.string().optional(),
  // Note: furnished removed — now covered by 'Amueblado' and 'Equipado' in amenities
  utilitiesIncluded: z.boolean().optional(),
  includedServices: z.array(z.enum(RENTAL_INCLUDED_SERVICE_OPTIONS)).optional(),
  amenities: z.array(z.enum(RENTAL_AMENITY_OPTIONS)).optional(),
});

const rentalPropertySchema = basePropertySchema.extend({
  listingType: z.literal("for_rent"),
  price: optionalNumberInput(z.number()),
  monthlyRent: numberInput(
    z.number().min(1, "La renta mensual debe ser mayor a 0"),
  ),
  securityDeposit: optionalNumberInput(z.number()),
  leaseTermMonths: optionalNumberInput(z.number()),
  availableFrom: z.string().optional(),
  utilitiesIncluded: z.boolean().optional(),
  includedServices: z.array(z.enum(RENTAL_INCLUDED_SERVICE_OPTIONS)).optional(),
  amenities: z.array(z.enum(RENTAL_AMENITY_OPTIONS)).optional(),
  financeOptions: financeOptionsSchema.optional(),
});

export const propertySchema = z.discriminatedUnion("listingType", [
  salePropertySchema,
  rentalPropertySchema,
]);

export const propertyFormDefaults = {
  listingType: "for_sale",
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
  propertyType: "",
  bedrooms: 0,
  bathrooms: 0,
  squareMeters: 0,
  includedServices: [],
  amenities: [],
  photos: [],
  status: "disponible",
  visibility: "public",
  financeOptions: {
    cash: false,
    bankLoan: false,
    INFONAVIT: false,
    FOVISSSTE: false,
    paymentPlan: false,
    other: false,
  },
  latitude: null,
  longitude: null,
  parkingType: null,
  halfBaths: null,
  condition: null,
  yearBuilt: null,
  floors: null,
  lotSize: null,
  maintenanceFee: null,
  furnished: null,
  petFriendly: false,
  petFee: null,
  petDeposit: null,
  childrenWelcome: false,
  issuesInvoice: false,
};
