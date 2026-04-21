/**
 * Zod schema for Request More Information form
 */
import { z } from 'zod';

export const requestSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'El teléfono es requerido'),
  budget: z.string().optional(),
  financing: z.enum(['yes', 'no', 'maybe']).optional(),
  timeline: z.string().optional(),
  message: z.string().optional(),
});
