import type { BalanceTrend } from '@/types';

/**
 * Plain-language interpretations for every field on `FinancialHealth`, for
 * the Money page's full breakdown. This product is built for customers who
 * may not be financially fluent, so a bare ratio ("Income stability: 0.82")
 * is never shown on its own — every number here is paired with a
 * first-person sentence explaining what it actually means.
 *
 * Thresholds are a prototype display convention (same cutoffs used for the
 * short-phrase versions in signals.ts, kept in sync deliberately), not a
 * claimed financial standard.
 */
export type HealthLevel = 'good' | 'watch' | 'poor' | 'neutral';

export interface HealthInterpretation {
  text: string;
  level: HealthLevel;
}

const NOT_ENOUGH_HISTORY: HealthInterpretation = {
  text: 'Not enough history yet to work this out.',
  level: 'neutral',
};

export function interpretEmiToIncome(value: number | null): HealthInterpretation {
  if (value === null) return NOT_ENOUGH_HISTORY;
  if (value <= 0.35) return { text: 'Your loan repayments take up a comfortable share of your income.', level: 'good' };
  if (value <= 0.5) return { text: 'Your loan repayments are on the higher side — worth keeping an eye on.', level: 'watch' };
  return { text: 'Your loan repayments are taking up more of your income than is typically comfortable.', level: 'poor' };
}

export function interpretSavingsRate(value: number | null): HealthInterpretation {
  if (value === null) return NOT_ENOUGH_HISTORY;
  if (value >= 0.2) return { text: "You're saving a healthy share of your income each month.", level: 'good' };
  if (value >= 0.1) return { text: "You're saving a modest share of your income — there's room to grow this.", level: 'watch' };
  return { text: "You're saving less than a typically healthy pace right now.", level: 'poor' };
}

export function interpretExpenseToIncome(value: number | null): HealthInterpretation {
  if (value === null) return NOT_ENOUGH_HISTORY;
  if (value <= 0.7) return { text: 'Your spending stays comfortably within your income.', level: 'good' };
  if (value <= 0.9) return { text: 'Your spending is using most of your income each month.', level: 'watch' };
  return { text: 'Your spending is very close to, or above, your income.', level: 'poor' };
}

export function interpretIncomeStability(value: number | null): HealthInterpretation {
  if (value === null) return NOT_ENOUGH_HISTORY;
  if (value >= 0.8) return { text: 'Your income is steady month to month.', level: 'good' };
  if (value >= 0.5) return { text: 'Your income varies somewhat from month to month.', level: 'watch' };
  return { text: 'Your income varies quite a bit from month to month.', level: 'poor' };
}

export function interpretBalanceTrend(trend: BalanceTrend | null): HealthInterpretation & { label: string } {
  if (trend === 'IMPROVING') return { label: 'Improving', text: 'Your balance has been improving recently.', level: 'good' };
  if (trend === 'STABLE') return { label: 'Stable', text: 'Your balance has stayed about the same recently.', level: 'neutral' };
  if (trend === 'DECLINING') return { label: 'Declining', text: 'Your balance has been declining recently — worth a closer look.', level: 'poor' };
  return { label: 'Unknown', text: "We're still tracking how your balance moves over time.", level: 'neutral' };
}
