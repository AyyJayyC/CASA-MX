import { isMexicanCellPhone, unformatPhone, formatPhoneForDisplay, maskPhoneInput } from '../../lib/utils/phoneInput';

describe('isMexicanCellPhone', () => {
  it('accepts 10-digit number starting with 52', () => { expect(isMexicanCellPhone('523312345678')).toBe(true); });
  it('accepts with + prefix', () => { expect(isMexicanCellPhone('+525512345678')).toBe(true); });
  it('accepts 10-digit number with +52', () => { expect(isMexicanCellPhone('+525512345678')).toBe(true); });
  it('accepts 10 digits without country code', () => { expect(isMexicanCellPhone('5512345678')).toBe(true); });
  it('rejects short number', () => { expect(isMexicanCellPhone('55123')).toBe(false); });
  it('rejects empty string', () => { expect(isMexicanCellPhone('')).toBe(false); });
  it('rejects null without crashing', () => { expect(isMexicanCellPhone(null)).toBe(false); });
  it('rejects undefined without crashing', () => { expect(isMexicanCellPhone(undefined)).toBe(false); });
});

describe('unformatPhone', () => {
  it('removes spaces, dashes, parens and +', () => { expect(unformatPhone('+52 (55) 1234-5678')).toBe('525512345678'); });
  it('returns empty for null', () => { expect(unformatPhone(null)).toBe(''); });
  it('returns empty for undefined', () => { expect(unformatPhone(undefined)).toBe(''); });
  it('returns empty for empty string', () => { expect(unformatPhone('')).toBe(''); });
});

describe('formatPhoneForDisplay', () => {
  it('formats 10-digit phone', () => { expect(formatPhoneForDisplay('5512345678')).toBe('55 12 3456 78'); });
  it('formats 8-digit phone', () => { expect(formatPhoneForDisplay('12345678')).toBe('12 34 5678'); });
  it('formats short digits', () => { expect(formatPhoneForDisplay('1234')).toBe('12 34'); });
  it('formats very short', () => { expect(formatPhoneForDisplay('12')).toBe('12'); });
  it('returns empty for null', () => { expect(formatPhoneForDisplay(null)).toBe(''); });
  it('returns empty for undefined', () => { expect(formatPhoneForDisplay(undefined)).toBe(''); });
  it('returns empty for empty string', () => { expect(formatPhoneForDisplay('')).toBe(''); });
  it('strips non-digits before formatting', () => { expect(formatPhoneForDisplay('55-1234-5678')).toBe('55 12 3456 78'); });
});

describe('maskPhoneInput', () => {
  it('masks to 10 formatted digits', () => { expect(maskPhoneInput('5512345678', '')).toBe('55 12 3456 78'); });
  it('handles stripping non-digits', () => { expect(maskPhoneInput('55-1234-5678', '')).toBe('55 12 3456 78'); });
  it('truncates beyond 10 digits', () => { expect(maskPhoneInput('551234567890', '')).toBe('55 12 3456 78'); });
  it('handles null without crashing', () => { expect(maskPhoneInput(null, '5512')).toBe(''); });
  it('handles undefined without crashing', () => { expect(maskPhoneInput(undefined, '5512')).toBe(''); });
});
