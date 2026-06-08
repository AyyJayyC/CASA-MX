const MEXICAN_CELL_RE = /^(\+?52)?\d{10}$/;

export function isMexicanCellPhone(val) {
  return MEXICAN_CELL_RE.test(val);
}

export function unformatPhone(val) {
  if (!val) return "";
  return val.replace(/[\s\-\(\)\+]/g, "");
}

export function formatPhoneForDisplay(val) {
  if (!val) return "";
  const digits = val.replace(/\D/g, "");

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 8)
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 10)}`;
}

export function maskPhoneInput(value, previousValue) {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 10);
  const formatted = formatPhoneForDisplay(digits);

  if (digits.length < previousValue.replace(/\D/g, "").length) {
    return formatted;
  }

  return formatted;
}
