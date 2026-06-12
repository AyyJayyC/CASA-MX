import { formatCurrency, formatNumber, formatDate, formatRelativeTime, formatPercentage } from '@/lib/utils/format';

describe('Format Utilities — Production Gate', () => {
  describe('formatCurrency', () => {
    it('formats MXN pesos correctly', () => {
      expect(formatCurrency(2500000)).toBe('$2,500,000 MXN');
    });

    it('formats large numbers with commas', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000 MXN');
    });

    it('formats zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toBeTruthy();
    });

    it('returns dash for null', () => {
      expect(formatCurrency(null)).toBe('—');
    });

    it('returns dash for undefined', () => {
      expect(formatCurrency(undefined)).toBe('—');
    });

    it('returns dash for NaN', () => {
      expect(formatCurrency(NaN)).toBe('—');
    });
  });

  describe('formatNumber', () => {
    it('formats large numbers with commas', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('formats small numbers', () => {
      expect(formatNumber(42)).toBe('42');
    });

    it('returns dash for null', () => {
      expect(formatNumber(null)).toBe('—');
    });

    it('returns dash for NaN', () => {
      expect(formatNumber(NaN)).toBe('—');
    });
  });

  describe('formatDate', () => {
    it('formats ISO date string', () => {
      const result = formatDate('2024-12-25');
      expect(result).toBeTruthy();
      expect(result).not.toBe('—');
    });

    it('returns dash for null', () => {
      expect(formatDate(null)).toBe('—');
    });

    it('returns dash for empty string', () => {
      expect(formatDate('')).toBe('—');
    });

    it('returns dash for invalid date', () => {
      expect(formatDate('not-a-date')).toBe('—');
    });
  });

  describe('formatRelativeTime', () => {
    it('shows "Ahora" for very recent', () => {
      const recent = new Date(Date.now() - 30000).toISOString();
      expect(formatRelativeTime(recent)).toBe('Ahora');
    });

    it('shows minutes for recent', () => {
      const recent = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const result = formatRelativeTime(recent);
      expect(result).toContain('min');
    });

    it('shows hours for same day', () => {
      const recent = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
      const result = formatRelativeTime(recent);
      expect(result).toContain('h');
    });

    it('returns dash for null', () => {
      expect(formatRelativeTime(null)).toBe('—');
    });
  });

  describe('formatPercentage', () => {
    it('formats whole number percentage', () => {
      const result = formatPercentage(75);
      expect(result).toContain('75');
    });

    it('rounds decimal value', () => {
      const result = formatPercentage(0.75);
      expect(result).toContain('1');
    });

    it('returns dash for null', () => {
      expect(formatPercentage(null)).toBe('—');
    });
  });
});
