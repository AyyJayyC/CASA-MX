export const FINANCING_OPTIONS = [
  { value: 'cash', label: '💵 Efectivo', shortLabel: 'Efectivo' },
  { value: 'bankLoan', label: '🏦 Crédito bancario', shortLabel: 'Crédito bancario' },
  { value: 'INFONAVIT', label: '🏠 INFONAVIT', shortLabel: 'INFONAVIT' },
  { value: 'FOVISSSTE', label: '💼 FOVISSSTE', shortLabel: 'FOVISSSTE' },
  { value: 'paymentPlan', label: '📅 Plan de pagos', shortLabel: 'Plan de pagos' },
  { value: 'other', label: '✅ Otro', shortLabel: 'Otro' },
];

export const FINANCING_LABELS = Object.fromEntries(
  FINANCING_OPTIONS.map((opt) => [opt.value, opt.label])
);

export const FINANCING_SHORT_LABELS = Object.fromEntries(
  FINANCING_OPTIONS.map((opt) => [opt.value, opt.shortLabel])
);

export const FINANCING_ICONS = Object.fromEntries(
  FINANCING_OPTIONS.map((opt) => [opt.value, opt.label.slice(0, 2)])
);
