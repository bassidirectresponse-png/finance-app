/**
 * formatters.ts
 * Brazilian locale formatting utilities for Track Finance
 */

/**
 * Formats a number as Brazilian currency (BRL).
 * Example: 1234.56 → "R$ 1.234,56"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formats a date as a long Brazilian Portuguese string.
 * Example: new Date("2025-03-10") → "10 de março de 2025"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d)
}

/**
 * Formats a date as a short Brazilian date string.
 * Example: new Date("2025-03-10") → "10/03/2025"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

/**
 * Formats a number as a percentage with sign.
 * Example: 12.3 → "+12,3%"
 * Example: -5.2 → "-5,2%"
 */
export function formatPercent(value: number): string {
  const formatted = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value))

  const sign = value >= 0 ? "+" : "-"
  return `${sign}${formatted}%`
}

/**
 * Formats a number with Brazilian thousands separator (no decimals).
 * Example: 1234 → "1.234"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formats a compact number for large values.
 * Example: 1500000 → "1,5M"
 * Example: 45000 → "45K"
 */
export function formatCompactNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(".", ",")}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`
  }
  return formatNumber(value)
}

/**
 * Formats a date as month/year short label for charts.
 * Example: new Date("2025-03-10") → "Mar/25"
 */
export function formatMonthYear(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(d)
  const year = d.getFullYear().toString().slice(-2)
  // Capitalize first letter
  const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1).replace(".", "")
  return `${monthCapitalized}/${year}`
}

/**
 * Formats a date as relative time (e.g., "há 2 dias", "há 3 meses").
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Hoje"
  if (diffDays === 1) return "Ontem"
  if (diffDays < 7) return `Há ${diffDays} dias`
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semana(s)`
  if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} mês(es)`
  return `Há ${Math.floor(diffDays / 365)} ano(s)`
}

/**
 * Parses a Brazilian currency string back to a number.
 * Example: "R$ 1.234,56" → 1234.56
 */
export function parseCurrency(value: string): number {
  const cleaned = value
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
  return parseFloat(cleaned) || 0
}

/**
 * Returns a color class based on whether a value is positive, negative, or zero.
 */
export function getValueColorClass(value: number): string {
  if (value > 0) return "text-income"
  if (value < 0) return "text-expense"
  return "text-muted-foreground"
}

/**
 * Formats installment progress.
 * Example: (6, 48) → "6/48 parcelas"
 */
export function formatInstallments(paid: number, total: number): string {
  return `${paid}/${total} parcelas`
}
