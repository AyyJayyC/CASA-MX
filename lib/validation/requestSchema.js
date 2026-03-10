/**
 * Zod schema for Request More Information form
 */
import { z } from 'zod';

export const requestSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  phone: z.string().min(7, 'El teléfono es requerido')
});
