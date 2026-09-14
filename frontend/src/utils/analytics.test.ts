import { describe, expect, it } from 'vitest';
import { computeMonthlyTotals, computeCategoryTotals } from './analytics';
import { transactionsC1001, transactionsC1002 } from '@/test-fixtures';

describe('computeMonthlyTotals', () => {
  it('aggregates income and expense per month from raw transactions', () => {
    const totals = computeMonthlyTotals(transactionsC1001);
    const june = totals.find((t) => t.month === '2026-06');
    expect(june?.income).toBe(75000);
    expect(june?.expense).toBe(9000);
  });

  it('produces only one bucket for a single-month, thin-file customer', () => {
    const totals = computeMonthlyTotals(transactionsC1002);
    expect(totals).toHaveLength(1);
  });
});

describe('computeCategoryTotals', () => {
  it('only sums DEBIT transactions, sorted descending', () => {
    const totals = computeCategoryTotals(transactionsC1001);
    expect(totals.find((t) => t.category === 'SALARY')).toBeUndefined();
    expect(totals[0].total).toBeGreaterThanOrEqual(totals[totals.length - 1].total);
  });
});
