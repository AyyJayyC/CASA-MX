// ─── Financing options constants ───

export interface FinancingOption {
  value: string;
  label: string;
  shortLabel: string;
}

export const FINANCING_OPTIONS: FinancingOption[] = [
  { value: "cash", label: "💵 Efectivo", shortLabel: "Efectivo" },
  {
    value: "bankLoan",
    label: "🏦 Crédito bancario",
    shortLabel: "Crédito bancario",
  },
  { value: "INFONAVIT", label: "🏠 INFONAVIT", shortLabel: "INFONAVIT" },
  { value: "FOVISSSTE", label: "💼 FOVISSSTE", shortLabel: "FOVISSSTE" },
  {
    value: "paymentPlan",
    label: "📅 Plan de pagos",
    shortLabel: "Plan de pagos",
  },
  { value: "other", label: "✅ Otro", shortLabel: "Otro" },
];

export const FINANCING_VALUES = FINANCING_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

export const FINANCING_LABELS: Record<string, string> = Object.fromEntries(
  FINANCING_OPTIONS.map((opt) => [opt.value, opt.label]),
);

export const FINANCING_SHORT_LABELS: Record<string, string> =
  Object.fromEntries(FINANCING_OPTIONS.map((opt) => [opt.value, opt.shortLabel]));
