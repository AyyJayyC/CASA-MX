import { describe, it, expect } from 'vitest';
import { validateAddress, validateField, getValidEstados, getCitiesForEstado, getColoniasForCity, formatAddress } from '@/lib/utils/addressValidation';

describe('addressValidation', () => {
  describe('validateAddress', () => {
    it('returns invalid for null address', () => {
      const result = validateAddress(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Address is required');
    });

    it('returns invalid when estado is missing', () => {
      const result = validateAddress({ ciudad: 'Hermosillo', colonia: 'Centro' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Estado (state) is required');
    });

    it('returns invalid when ciudad is missing', () => {
      const result = validateAddress({ estado: 'Sonora', colonia: 'Centro' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Ciudad (city) is required');
    });

    it('returns invalid when colonia is missing', () => {
      const result = validateAddress({ estado: 'Sonora', ciudad: 'Hermosillo' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Colonia (neighborhood) is required');
    });

    it('returns invalid for bad postal code', () => {
      const result = validateAddress({ estado: 'Sonora', ciudad: 'Hermosillo', colonia: 'Centro', codigoPostal: 'abc' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Código Postal must be 5 digits (e.g., 06500)');
    });

    it('returns valid for good postal code', () => {
      const result = validateAddress({ estado: 'Sonora', ciudad: 'Hermosillo', colonia: 'Centro', codigoPostal: '83000' });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns warnings for unknown estado', () => {
      const result = validateAddress({ estado: 'Atlantis', ciudad: 'Capital', colonia: 'Centro' });
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateField', () => {
    it('returns invalid for empty estado', () => {
      const result = validateField('estado', '');
      expect(result.isValid).toBe(false);
    });

    it('returns invalid for empty ciudad', () => {
      const result = validateField('ciudad', '');
      expect(result.isValid).toBe(false);
    });

    it('returns warning for empty codigoPostal (optional)', () => {
      const result = validateField('codigoPostal', '');
      expect(result.warnings).toContain('Postal code is optional');
    });

    it('returns invalid for bad postal code', () => {
      const result = validateField('codigoPostal', '12');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Postal code must be exactly 5 digits');
    });

    it('returns valid for good postal code', () => {
      const result = validateField('codigoPostal', '83000');
      expect(result.isValid).toBe(true);
    });

    it('returns warning for city too short', () => {
      const result = validateField('ciudad', 'A');
      expect(result.errors).toContain('City name is too short');
    });

    it('returns warning for colonia too short', () => {
      const result = validateField('colonia', 'B');
      expect(result.errors).toContain('Neighborhood name is too short');
    });
  });

  describe('getValidEstados', () => {
    it('returns array of estado names', () => {
      const estados = getValidEstados();
      expect(Array.isArray(estados)).toBe(true);
      expect(estados.length).toBeGreaterThan(0);
    });
  });

  describe('getCitiesForEstado', () => {
    it('returns empty array for unknown estado', () => {
      expect(getCitiesForEstado('Atlantis')).toEqual([]);
    });
  });

  describe('getColoniasForCity', () => {
    it('returns empty array for unknown estado', () => {
      expect(getColoniasForCity('Atlantis', 'Capital')).toEqual([]);
    });
  });

  describe('formatAddress', () => {
    it('returns empty string for null', () => {
      expect(formatAddress(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(formatAddress()).toBe('');
    });

    it('joins address parts with commas', () => {
      const result = formatAddress({ colonia: 'Centro', ciudad: 'Hermosillo', estado: 'Sonora', codigoPostal: '83000' });
      expect(result).toBe('Centro, Hermosillo, Sonora, 83000');
    });

    it('skips missing parts', () => {
      const result = formatAddress({ colonia: 'Centro', estado: 'Sonora' });
      expect(result).toBe('Centro, Sonora');
    });
  });
});
