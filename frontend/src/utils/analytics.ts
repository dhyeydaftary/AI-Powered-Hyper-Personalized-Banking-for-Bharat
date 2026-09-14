import type { Transaction, TransactionCategory } from '@/types';

export interface MonthlyTotals {
  month: string; // "2026-06"
  label: string; // "Jun"
  income: number;
  expense: number;
  net: number;
}

/** Aggregates transactions already fetched into per-month income/expense
 * totals — purely client-side presentation, not a re-derivation of any
 * backend decision or ratio. */
export function computeMonthlyTotals(transactions: Transaction[]): MonthlyTotals[] {
  const byMonth = new Map<string, { income: number; expense: number }>();

  for (const tx of transactions) {
    const month = tx.date.slice(0, 7);
    const bucket = byMonth.get(month) ?? { income: 0, expense: 0 };
    if (tx.type === 'CREDIT') bucket.income += tx.amount;
    else bucket.expense += tx.amount;
    byMonth.set(month, bucket);
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, totals]) => ({
      month,
      label: new Date(`${month}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short' }),
      income: totals.income,
      expense: totals.expense,
      net: totals.income - totals.expense,
    }));
}

/**
 * Net cumulative position across the customer's recorded transaction
 * history (sum of CREDIT minus DEBIT amounts already fetched). The backend
 * does not expose a ledger balance field, so this is a derived aggregate of
 * real transaction amounts — a prototype display convention, not a claim
 * about the customer's actual core-banking balance. Callers should caption
 * it as "net of transactions on record" so it isn't mistaken for one.
 */
export function computeAvailableBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, tx) => sum + (tx.type === 'CREDIT' ? tx.amount : -tx.amount), 0);
}

export interface MonthlyRatioPoint {
  month: string;
  label: string;
  value: number | null;
}

/** Month-by-month savings rate, derived from the same monthly income/expense
 * buckets as the money-movement chart — a real trend, not just the two
 * endpoint values the backend's `savings_rate` signal exposes. */
export function computeMonthlySavingsRate(monthlyTotals: MonthlyTotals[]): MonthlyRatioPoint[] {
  return monthlyTotals.map((m) => ({
    month: m.month,
    label: m.label,
    value: m.income > 0 ? (m.income - m.expense) / m.income : null,
  }));
}

/** Month-by-month expense/income ratio, for decisions driven by a rising
 * expense trend rather than a single anomalous transaction. */
export function computeMonthlyExpenseRatio(monthlyTotals: MonthlyTotals[]): MonthlyRatioPoint[] {
  return monthlyTotals.map((m) => ({
    month: m.month,
    label: m.label,
    value: m.income > 0 ? m.expense / m.income : null,
  }));
}

/** Month-by-month EMI/income ratio, isolating EMI-category debits from
 * total spending — for decisions driven by loan-repayment burden. */
export function computeMonthlyEmiRatio(transactions: Transaction[]): MonthlyRatioPoint[] {
  const byMonth = new Map<string, { income: number; emi: number }>();

  for (const tx of transactions) {
    const month = tx.date.slice(0, 7);
    const bucket = byMonth.get(month) ?? { income: 0, emi: 0 };
    if (tx.type === 'CREDIT') bucket.income += tx.amount;
    if (tx.type === 'DEBIT' && tx.category === 'EMI') bucket.emi += tx.amount;
    byMonth.set(month, bucket);
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, totals]) => ({
      month,
      label: new Date(`${month}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short' }),
      value: totals.income > 0 ? totals.emi / totals.income : null,
    }));
}

export interface CategoryTotal {
  category: TransactionCategory;
  total: number;
}

export function computeCategoryTotals(transactions: Transaction[]): CategoryTotal[] {
  const byCategory = new Map<TransactionCategory, number>();

  for (const tx of transactions) {
    if (tx.type !== 'DEBIT') continue;
    byCategory.set(tx.category, (byCategory.get(tx.category) ?? 0) + tx.amount);
  }

  return Array.from(byCategory.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Same aggregation as `computeCategoryTotals`, but also excludes EMI —
 * for a "where does my discretionary money go" breakdown, a loan
 * repayment isn't a discretionary spending choice the way groceries or
 * shopping are. Kept as a separate function rather than changing
 * `computeCategoryTotals` itself, since the copilot's category answers
 * intentionally still include EMI.
 */
export function computeDiscretionarySpendingTotals(transactions: Transaction[]): CategoryTotal[] {
  return computeCategoryTotals(transactions).filter((entry) => entry.category !== 'EMI');
}

export interface TrendDirection {
  direction: 'up' | 'down' | 'flat';
  /** The label of the point where the current streak began, e.g. the month
   * a decline started — only present when direction isn't 'flat'. */
  sinceLabel?: string;
}

/**
 * Walks backward from the most recent point to find where the current
 * monotonic streak began, so a takeaway can honestly say "declining since
 * July" instead of just comparing two endpoints. Real computation over the
 * actual series, not a guess.
 */
export function describeTrendDirection(points: { label: string; value: number }[]): TrendDirection {
  if (points.length < 2) return { direction: 'flat' };
  const lastIndex = points.length - 1;
  const last = points[lastIndex].value;
  const prev = points[lastIndex - 1].value;

  if (last > prev) {
    let i = lastIndex;
    while (i > 0 && points[i].value >= points[i - 1].value) i--;
    return { direction: 'up', sinceLabel: points[i].label };
  }
  if (last < prev) {
    let i = lastIndex;
    while (i > 0 && points[i].value <= points[i - 1].value) i--;
    return { direction: 'down', sinceLabel: points[i].label };
  }
  return { direction: 'flat' };
}
