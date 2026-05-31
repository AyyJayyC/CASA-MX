const RFC_RE = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;

export function isValidRFC(val) {
  if (!val) return false;
  return RFC_RE.test(val.toUpperCase());
}

export function unformatRFC(val) {
  if (!val) return '';
  return val.replace(/[\s\-]/g, '').toUpperCase();
}

export function formatRFCForDisplay(val) {
  if (!val) return '';
  const clean = val.replace(/[\s\-]/g, '').toUpperCase().slice(0, 13);

  if (clean.length <= 3) return clean;
  if (clean.length <= 4) return clean;
  if (clean.length <= 10) return `${clean.slice(0, 3)}${clean.slice(3, 4)}${clean.slice(4)}`;
  return `${clean.slice(0, 3)}${clean.slice(3, 4)}${clean.slice(4, 10)}${clean.slice(10)}`;
}

export function maskRFCInput(value) {
  if (!value) return '';
  const clean = value.replace(/[^a-zA-Z0-9Ññ&]/g, '').toUpperCase().slice(0, 13);
  return clean;
}
