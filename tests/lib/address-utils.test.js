import { describe, it, expect } from 'vitest';
import {
  getComponent,
  normalizeAddressText,
  getMapsErrorMessage,
  getTypedStreetPrefix,
  buildGeocodeQueryFromSuggestion,
  normalizeSuggestionText,
} from '../../lib/address-utils';

// ─── getComponent ────────────────────────────────────────────────
describe('getComponent', () => {
  it('returns long_name when type matches', () => {
    const components = [
      { types: ['route'], long_name: 'Calle Reforma' },
      { types: ['locality'], long_name: 'Ciudad de Mexico' },
    ];
    expect(getComponent(components, 'locality')).toBe('Ciudad de Mexico');
  });

  it('returns empty string when no component matches', () => {
    const components = [
      { types: ['route'], long_name: 'Calle Reforma' },
    ];
    expect(getComponent(components, 'locality')).toBe('');
  });

  it('returns empty string for null components', () => {
    expect(getComponent(null, 'route')).toBe('');
  });

  it('returns empty string for undefined components', () => {
    expect(getComponent(undefined, 'route')).toBe('');
  });

  it('returns empty string for empty components array', () => {
    expect(getComponent([], 'route')).toBe('');
  });

  it('returns empty string when component has no types', () => {
    const components = [
      { long_name: 'Some Place' },
    ];
    expect(getComponent(components, 'route')).toBe('');
  });

  it('returns empty string when long_name is falsy', () => {
    const components = [
      { types: ['route'], long_name: '' },
    ];
    expect(getComponent(components, 'route')).toBe('');
  });
});

// ─── normalizeAddressText ─────────────────────────────────────────
describe('normalizeAddressText', () => {
  it('removes accents and lowercases', () => {
    expect(normalizeAddressText('Calle Reforma 123')).toBe('calle reforma 123');
  });

  it('normalizes Spanish special characters', () => {
    expect(normalizeAddressText('Avenida Niño Héroes')).toBe('avenida nino heroes');
  });

  it('handles empty string', () => {
    expect(normalizeAddressText('')).toBe('');
  });

  it('handles null gracefully', () => {
    expect(normalizeAddressText(null)).toBe('');
  });

  it('handles undefined gracefully', () => {
    expect(normalizeAddressText(undefined)).toBe('');
  });

  it('trims whitespace', () => {
    expect(normalizeAddressText('  Calle 5 de Mayo  ')).toBe('calle 5 de mayo');
  });

  it('handles numbers in string', () => {
    expect(normalizeAddressText(123)).toBe('123');
  });
});

// ─── getMapsErrorMessage ──────────────────────────────────────────
describe('getMapsErrorMessage', () => {
  const fallback = 'Error de conexion';

  it('extracts message from payload.message', () => {
    const payload = { message: 'ZERO_RESULTS' };
    expect(getMapsErrorMessage(payload, fallback)).toBe('ZERO_RESULTS');
  });

  it('extracts error from payload.error when no message', () => {
    const payload = { error: 'REQUEST_DENIED' };
    expect(getMapsErrorMessage(payload, fallback)).toBe('REQUEST_DENIED');
  });

  it('prefers payload.message over payload.error', () => {
    const payload = { message: 'ZERO_RESULTS', error: 'REQUEST_DENIED' };
    expect(getMapsErrorMessage(payload, fallback)).toBe('ZERO_RESULTS');
  });

  it('returns fallback when payload is null', () => {
    expect(getMapsErrorMessage(null, fallback)).toBe(fallback);
  });

  it('returns fallback when payload is undefined', () => {
    expect(getMapsErrorMessage(undefined, fallback)).toBe(fallback);
  });

  it('returns fallback when payload is empty object', () => {
    expect(getMapsErrorMessage({}, fallback)).toBe(fallback);
  });

  it('trims whitespace from message', () => {
    const payload = { message: '  ZERO_RESULTS  ' };
    expect(getMapsErrorMessage(payload, fallback)).toBe('ZERO_RESULTS');
  });

  it('returns fallback when message is empty string', () => {
    const payload = { message: '' };
    expect(getMapsErrorMessage(payload, fallback)).toBe(fallback);
  });

  it('handles non-string message gracefully', () => {
    const payload = { message: 404 };
    expect(getMapsErrorMessage(payload, fallback)).toBe(fallback);
  });
});

// ─── getTypedStreetPrefix ─────────────────────────────────────────
describe('getTypedStreetPrefix', () => {
  it('returns empty string when typed is empty', () => {
    expect(getTypedStreetPrefix('', 'Calle Reforma')).toBe('');
  });

  it('returns empty string when typed has no numbers', () => {
    expect(getTypedStreetPrefix('Calle Reforma', 'Calle Reforma, CDMX')).toBe('');
  });

  it('returns empty string when no description provided', () => {
    expect(getTypedStreetPrefix('Calle 123', '')).toBe('Calle 123');
  });

  it('returns typed input when description has no matching tokens', () => {
    const result = getTypedStreetPrefix('Calle 123', 'Some Other, Place');
    // The typed has number, description has tokens but no match found
    // candidate after loop will be 'Calle 123' which has a digit → returns typed
    expect(result).toBe('Calle 123');
  });

  it('strips matching description tokens from typed', () => {
    const result = getTypedStreetPrefix(
      'Calle 123 Reforma, CDMX',
      'Reforma, CDMX',
    );
    expect(result).toBe('Calle 123');
  });

  it('strips longest token first, but falls back to original if digits are lost', () => {
    // typed: 'Av. Ignacio Zaragoza 123', description: 'Ignacio Zaragoza, Santa Catarina'
    // Longest token 'Ignacio Zaragoza' strips away the digits, so
    // the candidate ('Av.') has no digits → falls back to original typed
    const result = getTypedStreetPrefix(
      'Av. Ignacio Zaragoza 123',
      'Ignacio Zaragoza, Santa Catarina',
    );
    expect(result).toBe('Av. Ignacio Zaragoza 123');
  });

  it('handles null typed with empty', () => {
    expect(getTypedStreetPrefix(null)).toBe('');
  });

  it('strips longest token with digits early but falls back when digit lost', () => {
    // '5 de Mayo' contains the only digit; stripping it leaves 'Calle' (no digit)
    // → falls back to original typed to preserve the number-bearing input
    const result = getTypedStreetPrefix(
      'Calle 5 de Mayo, Centro',
      'Centro, 5 de Mayo',
    );
    expect(result).toBe('Calle 5 de Mayo, Centro');
  });

  it('strips neighborhood token while preserving number in remaining text', () => {
    // 'Calle 123 Reforma, CDMX' with description 'Reforma, CDMX'
    // 'Reforma' (length 7) is stripped first, leaving 'Calle 123, CDMX'
    // 'CDMX' matches and is stripped, leaving 'Calle 123'
    // 'Calle 123' has a digit → return it
    const result = getTypedStreetPrefix(
      'Calle 123 Reforma, CDMX',
      'Reforma, CDMX',
    );
    expect(result).toBe('Calle 123');
  });
});

// ─── buildGeocodeQueryFromSuggestion ──────────────────────────────
describe('buildGeocodeQueryFromSuggestion', () => {
  it('returns typed input when suggestion has no description', () => {
    const result = buildGeocodeQueryFromSuggestion(
      'Calle 123',
      { structured_formatting: {} },
    );
    expect(result).toBe('Calle 123');
  });

  it('returns description when typed has no numbers', () => {
    const result = buildGeocodeQueryFromSuggestion(
      'Calle Reforma',
      { description: 'Calle Reforma, Ciudad de Mexico, CDMX' },
    );
    expect(result).toBe('Calle Reforma, Ciudad de Mexico, CDMX');
  });

  it('falls back to description when typed does not start with structured main_text', () => {
    // typed 'Calle 123' does NOT start with 'Calle Reforma 123' (normalized)
    // So the structured formatting path is skipped, and the first description
    // part 'Calle Reforma 123' also doesn't match typed prefix → returns description
    const result = buildGeocodeQueryFromSuggestion(
      'Calle 123',
      {
        description: 'Calle Reforma 123, CDMX, Mexico',
        structured_formatting: {
          main_text: 'Calle Reforma 123',
          secondary_text: 'CDMX, Mexico',
        },
      },
    );
    expect(result).toBe('Calle Reforma 123, CDMX, Mexico');
  });

  it('returns description when typed prefix does not match first part', () => {
    // typed: 'Calle 123 Reforma' normalized = 'calle 123 reforma'
    // first description part normalized = 'calle reforma'
    // 'calle 123 reforma'.startsWith('calle reforma') → false
    // → falls back to returning the description unchanged
    const result = buildGeocodeQueryFromSuggestion(
      'Calle 123 Reforma',
      {
        description: 'Calle Reforma, Ciudad de Mexico, CDMX',
        structured_formatting: {},
      },
    );
    expect(result).toBe('Calle Reforma, Ciudad de Mexico, CDMX');
  });

  it('builds query from structured_formatting when typed prefix matches main_text', () => {
    const result = buildGeocodeQueryFromSuggestion(
      'Calle Reforma 123',
      {
        description: 'Calle Reforma 123, CDMX, Mexico',
        structured_formatting: {
          main_text: 'Calle Reforma 123',
          secondary_text: 'CDMX, Mexico',
        },
      },
    );
    expect(result).toBe('Calle Reforma 123, CDMX, Mexico');
  });

  it('builds query from description parts when typed prefix matches first part', () => {
    const result = buildGeocodeQueryFromSuggestion(
      'Calle Reforma 123',
      {
        description: 'Calle Reforma, CDMX',
        structured_formatting: {},
      },
    );
    // 'calle reforma 123'.startsWith('calle reforma') → true
    expect(result).toBe('Calle Reforma 123, CDMX');
  });

  it('returns description when typed does not match any part', () => {
    const result = buildGeocodeQueryFromSuggestion(
      'Avenida 456',
      {
        description: 'Calle Reforma, CDMX',
        structured_formatting: {
          main_text: 'Calle Reforma',
          secondary_text: 'CDMX',
        },
      },
    );
    // typed starts with 'avenida', main starts with 'calle' → no match
    // first part of description is 'Calle Reforma', typed is 'Avenida 456' → no match
    expect(result).toBe('Calle Reforma, CDMX');
  });

  it('handles null suggestion gracefully', () => {
    const result = buildGeocodeQueryFromSuggestion('Calle 123', null);
    expect(result).toBe('Calle 123');
  });

  it('handles empty typed with description', () => {
    const result = buildGeocodeQueryFromSuggestion(
      '',
      { description: 'Calle Reforma, CDMX' },
    );
    expect(result).toBe('Calle Reforma, CDMX');
  });

  it('returns empty string when both typed and description are empty', () => {
    const result = buildGeocodeQueryFromSuggestion('', {});
    expect(result).toBe('');
  });
});

// ─── normalizeSuggestionText ──────────────────────────────────────
describe('normalizeSuggestionText', () => {
  it('removes accents and lowercases', () => {
    expect(normalizeSuggestionText('México DF')).toBe('mexico df');
  });

  it('handles empty string', () => {
    expect(normalizeSuggestionText('')).toBe('');
  });

  it('handles null gracefully', () => {
    expect(normalizeSuggestionText(null)).toBe('');
  });

  it('handles undefined gracefully', () => {
    expect(normalizeSuggestionText(undefined)).toBe('');
  });

  it('trims whitespace', () => {
    expect(normalizeSuggestionText('  Ciudad de México  ')).toBe('ciudad de mexico');
  });

  it('normalizes special unicode characters', () => {
    expect(normalizeSuggestionText('Avenida Álamos')).toBe('avenida alamos');
  });
});
