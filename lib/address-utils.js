export const getComponent = (components, type) =>
  components?.find(c => c.types?.includes(type))?.long_name || '';

export const normalizeAddressText = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const getMapsErrorMessage = (payload, fallbackMessage) => {
  if (payload && typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message.trim();
  }
  if (payload && typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error.trim();
  }
  return fallbackMessage;
};

export const getTypedStreetPrefix = (typed, selectedDescription = '') => {
  const v = String(typed || '').trim();
  if (!v) return '';
  if (!/\d/.test(v)) return '';
  const description = String(selectedDescription || '').trim();
  if (!description) return v;
  let candidate = v;
  const tokens = description
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  for (const token of tokens) {
    const idx = candidate.toLowerCase().indexOf(token.toLowerCase());
    if (idx >= 0) {
      candidate = candidate.slice(0, idx).trim().replace(/[,\-]\s*$/, '');
    }
  }
  return /\d/.test(candidate) ? candidate : v;
};

export const buildGeocodeQueryFromSuggestion = (typedInput, suggestion) => {
  const typed = String(typedInput || '').trim();
  const description = String(suggestion?.description || '').trim();
  if (!description) return typed;
  const hasTypedNumber = /\d/.test(typed);
  if (!hasTypedNumber) return description;
  const structuredMain = String(suggestion?.structured_formatting?.main_text || '').trim();
  const structuredSecondary = String(suggestion?.structured_formatting?.secondary_text || '').trim();
  const typedNorm = normalizeAddressText(typed);
  const mainNorm = normalizeAddressText(structuredMain);
  if (structuredMain && structuredSecondary && typedNorm.startsWith(mainNorm)) {
    return `${typed}, ${structuredSecondary}`;
  }
  const descriptionParts = description.split(',').map((part) => part.trim()).filter(Boolean);
  if (descriptionParts.length > 0) {
    const firstPartNorm = normalizeAddressText(descriptionParts[0]);
    if (typedNorm.startsWith(firstPartNorm)) {
      return [typed, ...descriptionParts.slice(1)].join(', ');
    }
  }
  return description;
};

export const normalizeSuggestionText = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
