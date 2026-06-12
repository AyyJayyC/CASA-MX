import { describe, it, expect } from 'vitest';
import { contactRequestSchema } from '@/lib/validation/contactRequestSchema';

describe('Form Validation — Production Gate', () => {
  describe('Contact Request Schema', () => {
    it('accepts valid Mexican phone number', () => {
      const valid = contactRequestSchema.parse({ name: 'Carlos', phone: '6621234567' });
      expect(valid.phone).toBe('6621234567');
    });

    it('strips spaces, dashes, and parens from phone', () => {
      const result = contactRequestSchema.parse({ name: 'Luis', phone: '(662) 123-4567' });
      expect(result.phone).toBe('6621234567');
    });

    it('rejects phone shorter than 10 digits', () => {
      expect(() => contactRequestSchema.parse({ name: 'Bad', phone: '12345' }))
        .toThrow();
    });

    it('rejects international non-Mexican phone', () => {
      expect(() => contactRequestSchema.parse({ name: 'Bad', phone: '14155551234' }))
        .toThrow();
    });

    it('rejects empty name', () => {
      expect(() => contactRequestSchema.parse({ name: '', phone: '6621234567' }))
        .toThrow();
    });

    it('rejects name shorter than 2 chars', () => {
      expect(() => contactRequestSchema.parse({ name: 'A', phone: '6621234567' }))
        .toThrow();
    });

    it('rejects name longer than 100 chars', () => {
      expect(() => contactRequestSchema.parse({ name: 'A'.repeat(101), phone: '6621234567' }))
        .toThrow();
    });

    it('rejects message longer than 500 chars', () => {
      expect(() => contactRequestSchema.parse({ name: 'Valid', phone: '6621234567', message: 'X'.repeat(501) }))
        .toThrow();
    });

    it('accepts optional message field', () => {
      const result = contactRequestSchema.parse({ name: 'Maria', phone: '6621234567' });
      expect(result.message).toBeUndefined();
    });

    it('handles unicode names', () => {
      const result = contactRequestSchema.parse({ name: 'José María', phone: '6621234567' });
      expect(result.name).toBe('José María');
    });

    it('accepts +52 prefix', () => {
      const result = contactRequestSchema.parse({ name: 'Ana', phone: '+526621234567' });
      expect(result.phone).toBe('526621234567');
    });
  });
});
