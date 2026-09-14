/**
 * Centralized formatting utilities. Use these everywhere instead of
 * formatting currency, dates, or percentages inline in components, so
 * presentation stays consistent across screens.
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrFormatterPrecise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

/** ₹2,50,000 — Indian digit grouping, no decimals for whole rupee amounts. */
export function formatCurrency(amount: number, precise = false): string {
  return precise ? inrFormatterPrecise.format(amount) : inrFormatter.format(amount);
}

export function formatSignedCurrency(amount: number): string {
  const formatted = formatCurrency(Math.abs(amount));
  return amount < 0 ? `-${formatted}` : `+${formatted}`;
}

/** 0.183 -> "18.3%" (ratios from the backend are decimals, not percentages). */
export function formatPercent(ratio: number | null | undefined, fractionDigits = 0): string {
  if (ratio === null || ratio === undefined || Number.isNaN(ratio)) return '—';
  return `${(ratio * 100).toFixed(fractionDigits)}%`;
}

export function formatPercentPoints(ratio: number): string {
  const points = Math.round(ratio * 100);
  return `${points > 0 ? '+' : ''}${points} pts`;
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dateFormatterShort = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
});

const monthFormatter = new Intl.DateTimeFormat('en-IN', {
  month: 'long',
  year: 'numeric',
});

/** Parses a "YYYY-MM-DD" date string as a local calendar date, not UTC midnight. */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatDate(iso: string): string {
  return dateFormatter.format(parseIsoDate(iso));
}

export function formatDateShort(iso: string): string {
  return dateFormatterShort.format(parseIsoDate(iso));
}

export function formatMonthYear(iso: string): string {
  return monthFormatter.format(parseIsoDate(iso));
}

/** Groups a date into a relative bucket for transaction list headers. */
export function relativeDateGroup(iso: string): string {
  const date = parseIsoDate(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return 'This week';
  if (diffDays > 7 && diffDays <= 30) return 'This month';
  return formatMonthYear(iso);
}

export function formatTransactionType(type: 'CREDIT' | 'DEBIT'): string {
  return type === 'CREDIT' ? 'Money in' : 'Money out';
}

const categoryLabels: Record<string, string> = {
  SALARY: 'Salary',
  EMI: 'EMI',
  GROCERIES: 'Groceries',
  RENT: 'Rent',
  UTILITIES: 'Utilities',
  SHOPPING: 'Shopping',
  TRAVEL: 'Travel',
  HEALTH: 'Health',
  TRANSFER: 'Transfer',
  OTHER: 'Other',
};

export function formatCategory(category: string): string {
  return categoryLabels[category] ?? category;
}
