import { useMemo } from 'react';
import { Landmark } from 'lucide-react';
import { useDemoCustomer } from '@/state/demo-customer-context';
import { useLoans } from '@/hooks/useLoans';
import { Skeleton } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeading } from '@/components/common/SectionHeading';
import { RepaymentRing } from '@/components/loans/RepaymentRing';
import { PayoffChart } from '@/components/loans/PayoffChart';
import {
  computeRepaymentRatio,
  computeTotalRemaining,
  computeRemainingInterest,
  computePayoffSchedule,
} from '@/utils/loanMath';
import { formatCurrency } from '@/utils/format';
import type { Loan } from '@/types';

/**
 * A single loan's full picture. There is no loan-type field on the
 * backend, so "Personal Loan" here is purely a display convention for
 * this loan shape (a fixed-principal, fixed-EMI loan with no collateral
 * fields) — never presented as data the backend returned.
 */
function LoanCard({ loan }: { loan: Loan }) {
  const repaidRatio = computeRepaymentRatio(loan);
  const totalRemaining = computeTotalRemaining(loan);
  const remainingInterest = computeRemainingInterest(loan);
  const schedule = useMemo(() => computePayoffSchedule(loan), [loan]);
  const hasProjection = loan.remaining_months > 0 && schedule.length > 1;

  return (
    <div className="flex flex-col gap-xl">
      <div className="rounded-lg border border-hairline bg-canvas p-base sm:p-lg">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Personal Loan</p>

        <div className="mt-2 flex flex-col gap-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-muted">Outstanding balance</span>
            <div className="font-mono text-3xl font-semibold tabular-nums text-ink sm:text-4xl">
              {formatCurrency(loan.outstanding)}
            </div>
          </div>
          <RepaymentRing ratio={repaidRatio} />
        </div>

        <div className="mt-lg grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md bg-surface-soft p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Original amount</p>
            <p className="mt-1 font-mono text-base font-medium tabular-nums text-ink">{formatCurrency(loan.principal)}</p>
          </div>
          <div className="rounded-md bg-surface-soft p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Monthly EMI</p>
            <p className="mt-1 font-mono text-base font-medium tabular-nums text-ink">{formatCurrency(loan.monthly_emi)}</p>
          </div>
          <div className="rounded-md bg-surface-soft p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Interest rate</p>
            <p className="mt-1 font-mono text-base font-medium tabular-nums text-ink">{loan.annual_interest_rate}% p.a.</p>
          </div>
          <div className="rounded-md bg-surface-soft p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Remaining</p>
            <p className="mt-1 font-mono text-base font-medium tabular-nums text-ink">{loan.remaining_months} months</p>
          </div>
        </div>

        <div className="mt-lg rounded-md bg-surface-soft p-base">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Total remaining to pay</p>
          <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-ink">{formatCurrency(totalRemaining)}</p>
          <p className="mt-1 text-xs text-muted">
            {formatCurrency(remainingInterest)} of that is interest, on top of the {formatCurrency(loan.outstanding)} you
            still owe.
          </p>
        </div>
      </div>

      {hasProjection && (
        <section>
          <SectionHeading
            title="Payoff projection"
            description="Estimated payoff schedule based on your current EMI — a projection calculated from your loan's numbers, not a schedule your bank sent us."
          />
          <div className="rounded-lg border border-hairline bg-canvas p-base sm:p-lg">
            <PayoffChart data={schedule} datasetKey={loan.loan_id} />
          </div>
        </section>
      )}
    </div>
  );
}

function LoansPageSkeleton() {
  return (
    <div className="flex flex-col gap-xl" role="status" aria-label="Loading your loans">
      <div className="rounded-lg border border-hairline bg-canvas p-base sm:p-lg">
        <Skeleton className="h-3 w-24" />
        <div className="mt-3 flex items-center justify-between gap-lg">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-9 w-40" />
          </div>
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
        <div className="mt-lg grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LoansPage() {
  const { customerId } = useDemoCustomer();
  const query = useLoans(customerId);
  const loans = query.data ?? [];

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="text-xl font-semibold text-ink sm:text-2xl">Loans</h1>
        <p className="mt-1 text-sm text-muted">Your active loans and repayment progress.</p>
      </div>

      {query.isLoading ? (
        <LoansPageSkeleton />
      ) : query.isError ? (
        <ErrorState title="We couldn't load your loans." error={query.error} onRetry={() => query.refetch()} />
      ) : loans.length === 0 ? (
        <EmptyState
          icon={<Landmark size={22} />}
          title="You don't currently have any active loans."
          description="When you take one out, it will appear here with your repayment progress."
        />
      ) : (
        <div className="flex flex-col gap-xl">
          {loans.map((loan) => (
            <LoanCard key={loan.loan_id} loan={loan} />
          ))}
        </div>
      )}
    </div>
  );
}
