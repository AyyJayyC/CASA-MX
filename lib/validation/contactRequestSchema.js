/**
 * Zod schema for Contact Request (Solicitar dirección) form
 */
import { z } from "zod";

const MEXICAN_PHONE_RE = /^(\+?52)?\d{10}$/;

export const contactRequestSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre es requerido")
    .max(100, "Nombre demasiado largo"),
  phone: z
    .string()
    .transform((val) => val.replace(/[\s\-\(\)\+]/g, ""))
    .refine(
      (val) => MEXICAN_PHONE_RE.test(val),
      "Número de teléfono inválido. Debe ser un número mexicano.",
    ),
  message: z.string().max(500, "Mensaje demasiado largo").optional(),
});
