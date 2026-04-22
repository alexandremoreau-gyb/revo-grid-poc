const USD_LOCALE = 'en-US'
const DATE_LOCALE = 'fr-FR'

export function toNumber(value: unknown): number {
  return Number(value ?? 0)
}

export function formatPrice(value: number): string {
  if (value >= 1000) {
    return new Intl.NumberFormat(USD_LOCALE, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (value >= 1) {
    return new Intl.NumberFormat(USD_LOCALE, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value)
  }

  return new Intl.NumberFormat(USD_LOCALE, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(value)
}

export function formatLargeNumber(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toLocaleString(USD_LOCALE)}`
}

export function formatTrend(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

export function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(DATE_LOCALE, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[]
  if (typeof value === 'string') return value.split(',').map(tag => tag.trim())
  return []
}

export function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  return String(value).toLowerCase() === 'true'
}

export function progressWidth(value: number): string {
  return `${Math.max(0, Math.min(100, value))}%`
}
