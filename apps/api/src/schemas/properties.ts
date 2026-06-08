// Re-exports from shared package
// Backend uses shared schemas directly; this file exists for backward compatibility
export {
  createPropertySchema,
  updatePropertySchema,
  propertyFilterSchema,
  promotePropertySchema,
  type CreatePropertyInput,
  type UpdatePropertyInput,
  type PropertyFilter,
} from "@casa-mx/shared";
