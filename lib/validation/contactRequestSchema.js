/**
 * Zod schema for Contact Request (Solicitar dirección) form
 */
import { z } from 'zod';

const MEXICAN_PHONE_RE = /^\+?52?\d{10,13}$/;

export const contactRequestSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido').max(100, 'Nombre demasiado largo'),
  phone: z.string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'Teléfono inválido')
    .regex(MEXICAN_PHONE_RE, 'Número de teléfono inválido. Debe ser un número mexicano.')
    .transform((val) => val.replace(/[\s\-\(\)\+]/g, '')),
  message: z.string().max(500, 'Mensaje demasiado largo').optional(),
});
