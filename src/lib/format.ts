export function formatPrice(price?: number | null): string {
  if (price == null) return "$0"
  if (price >= 1_000_000) {
    return `$${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}M MXN`
  }
  return `$${price.toLocaleString()} MXN`
}
