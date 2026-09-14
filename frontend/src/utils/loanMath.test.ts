import { describe, expect, it } from 'vitest';
import {
  computeRepaymentRatio,
  computeTotalRemaining,
  computeRemainingInterest,
  computePayoffSchedule,
} from './loanMath';
import { loanC1001 } from '@/test-fixtures';

describe('computeRepaymentRatio', () => {
  it('computes (principal - outstanding) / principal', () => {
    expect(computeRepaymentRatio(loanC1001)).toBeCloseTo(0.28, 5);
  });

  it('never divides by zero for a zero-principal loan', () => {
    expect(computeRepaymentRatio({ ...loanC1001, principal: 0 })).toBe(0);
  });
});

describe('computeTotalRemaining', () => {
  it('is monthly_emi times remaining_months', () => {
    expect(computeTotalRemaining(loanC1001)).toBe(9000 * 24);
  });
});

describe('computeRemainingInterest', () => {
  it('is total remaining minus the outstanding principal', () => {
    expect(computeRemainingInterest(loanC1001)).toBe(9000 * 24 - 180000);
  });
});

describe('computePayoffSchedule', () => {
  it('starts at the real outstanding balance and never goes negative', () => {
    const schedule = computePayoffSchedule(loanC1001);
    expect(schedule[0]).toEqual({ month: 0, label: 'Now', balance: 180000 });
    expect(schedule.every((point) => point.balance >= 0)).toBe(true);
  });

  it('produces exactly one point per remaining month, plus the starting point', () => {
    const schedule = computePayoffSchedule(loanC1001);
    expect(schedule).toHaveLength(loanC1001.remaining_months + 1);
  });

  it('declines monotonically toward zero (never increases)', () => {
    const schedule = computePayoffSchedule(loanC1001);
    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i].balance).toBeLessThanOrEqual(schedule[i - 1].balance);
    }
  });

  it('stays flat at zero once paid off early, rather than going negative', () => {
    // 9000/month clears 180000 at 11.5% faster than the stated 24 months
    // remain — a realistic mismatch between a synced "remaining_months"
    // field and a plain amortization recompute, which this must handle
    // honestly rather than paper over.
    const schedule = computePayoffSchedule(loanC1001);
    expect(schedule[schedule.length - 1].balance).toBe(0);
  });
});
