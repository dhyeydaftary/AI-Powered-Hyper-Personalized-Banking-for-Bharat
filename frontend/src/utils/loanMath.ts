import type { Loan } from '@/types';

/**
 * Every figure here is honest arithmetic on the seven real fields the
 * backend actually returns (principal, outstanding, monthly_emi,
 * annual_interest_rate, remaining_months, created_at, updated_at) —
 * there is no loan-type or due-date field, and nothing here invents one.
 */

/** (principal − outstanding) / principal — how much of the original loan
 * has been repaid so far. */
export function computeRepaymentRatio(loan: Loan): number {
  return loan.principal > 0 ? (loan.principal - loan.outstanding) / loan.principal : 0;
}

/** monthly_emi × remaining_months — the sum of every EMI still to be paid. */
export function computeTotalRemaining(loan: Loan): number {
  return loan.monthly_emi * loan.remaining_months;
}

/** Total remaining EMIs minus the outstanding principal they cover — the
 * portion of what's left to pay that is interest, not principal. */
export function computeRemainingInterest(loan: Loan): number {
  return computeTotalRemaining(loan) - loan.outstanding;
}

export interface PayoffPoint {
  month: number;
  label: string;
  balance: number;
}

/**
 * A month-by-month declining-balance projection from `outstanding` toward
 * zero, using standard amortization math (interest accrues on the
 * remaining balance each month at the monthly rate implied by
 * `annual_interest_rate`; the rest of the EMI reduces principal). This is
 * a computed projection, not a schedule the backend returns — callers
 * must label it as such. If the real EMI pays the loan off faster than
 * `remaining_months` implies (or slower), the balance is clamped at zero
 * rather than let it go negative or keep counting down past payoff.
 */
export function computePayoffSchedule(loan: Loan): PayoffPoint[] {
  const monthlyRate = loan.annual_interest_rate / 12 / 100;
  const points: PayoffPoint[] = [{ month: 0, label: 'Now', balance: Math.round(loan.outstanding) }];

  let balance = loan.outstanding;
  for (let month = 1; month <= loan.remaining_months; month++) {
    if (balance > 0) {
      const interest = balance * monthlyRate;
      const principalPortion = loan.monthly_emi - interest;
      balance = Math.max(0, balance - principalPortion);
    }
    points.push({ month, label: `M${month}`, balance: Math.round(balance) });
  }

  return points;
}
