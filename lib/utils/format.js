const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const numberFormatter = new Intl.NumberFormat('es-MX');
const decimalFormatter = new Intl.NumberFormat('es-MX', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatNumber(n) {
  if (n == null || isNaN(n)) return '—';
  return numberFormatter.format(n);
}

export function formatDecimal(n) {
  if (n == null || isNaN(n)) return '—';
  return decimalFormatter.format(n);
}

export function formatCurrency(n) {
  if (n == null || isNaN(n)) return '—';
  return `$${numberFormatter.format(n)} MXN`;
}

export function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return dateFormatter.format(new Date(isoString));
  } catch {
    return '—';
  }
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  try {
    return dateTimeFormatter.format(new Date(isoString));
  } catch {
    return '—';
  }
}

export function formatRelativeTime(isoString) {
  if (!isoString) return '—';
  try {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return formatDate(isoString);
  } catch {
    return '—';
  }
}

export function formatPercentage(n) {
  if (n == null || isNaN(n)) return '—';
  return `${numberFormatter.format(Math.round(n))}%`;
}
