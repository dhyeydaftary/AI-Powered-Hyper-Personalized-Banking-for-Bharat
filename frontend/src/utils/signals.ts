import { formatCurrency, formatPercent } from './format';

/**
 * The decision's `signals` object is a free-form Record<string, unknown> —
 * only surface the keys we recognize and know how to present cleanly.
 * Anything else stays hidden rather than leaking raw technical output.
 */
const RATIO_KEYS: Record<string, string> = {
  emi_to_income_ratio: 'EMI / income',
  savings_rate: 'Savings rate',
  expense_to_income_ratio: 'Expense / income',
};

const CURRENCY_KEYS: Record<string, string> = {
  unusual_amount: 'Transaction amount',
};

const COUNT_KEYS: Record<string, string> = {
  history_months: 'Months of history',
};

export interface SignalEntry {
  key: string;
  label: string;
  value: string;
  /** A one-line plain-language reading of the number, so it is never shown
   * bare — this product is built for customers who may not be financially
   * fluent, so a percentage or ratio on its own is not enough (Section 22
   * "the change worth noticing" fix). Thresholds here are a prototype
   * display convention, not a claimed financial standard. */
  interpretation?: string;
}

/** Ratio interpretation thresholds. Prototype display convention only. */
function interpretRatio(key: string, value: number): string | undefined {
  if (key === 'emi_to_income_ratio') {
    if (value <= 0.35) return 'comfortably within a healthy range';
    if (value <= 0.5) return 'higher than typical — worth keeping an eye on';
    return 'significantly higher than a typical comfortable range';
  }
  if (key === 'savings_rate') {
    if (value >= 0.2) return 'a healthy savings pace';
    if (value >= 0.1) return 'a modest savings pace';
    return 'lower than a typical healthy pace';
  }
  if (key === 'expense_to_income_ratio') {
    if (value <= 0.7) return 'comfortably within your income';
    if (value <= 0.9) return 'using most of your income';
    return 'very close to or above your income';
  }
  return undefined;
}

function interpretCount(key: string, value: number): string | undefined {
  if (key === 'history_months') {
    if (value < 2) return 'very limited — early days for this analysis';
    if (value < 6) return 'a modest amount of history';
    return 'a solid base of history for this analysis';
  }
  return undefined;
}

export function getReadableSignals(signals: Record<string, unknown> | null | undefined): SignalEntry[] {
  if (!signals) return [];
  const entries: SignalEntry[] = [];

  for (const [key, label] of Object.entries(RATIO_KEYS)) {
    const value = signals[key];
    if (typeof value === 'number') {
      entries.push({ key, label, value: formatPercent(value, 1), interpretation: interpretRatio(key, value) });
    }
  }
  for (const [key, label] of Object.entries(CURRENCY_KEYS)) {
    const value = signals[key];
    if (typeof value === 'number') entries.push({ key, label, value: formatCurrency(value) });
  }
  for (const [key, label] of Object.entries(COUNT_KEYS)) {
    const value = signals[key];
    if (typeof value === 'number') {
      entries.push({ key, label, value: String(value), interpretation: interpretCount(key, value) });
    }
  }

  return entries;
}
