/**
 * Zod schema for Contact Request (Solicitar dirección) form
 */
import { z } from 'zod';

export const contactRequestSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  phone: z.string().min(7, 'El teléfono es requerido'),
  message: z.string().optional(),
});
