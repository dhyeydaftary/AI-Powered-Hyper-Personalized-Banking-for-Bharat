import { useMemo } from 'react';
import { useDemoCustomer } from '@/state/demo-customer-context';
import { useFinancialHealth } from '@/hooks/useFinancialHealth';
import { useTransactions } from '@/hooks/useTransactions';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Metric } from '@/components/ui/Metric';
import { LoadingState, CardSkeleton } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { TrendChart } from '@/components/charts/TrendChart';
import { SavingsRateChart } from '@/components/charts/SavingsRateChart';
import { CategoryBreakdown } from '@/components/charts/CategoryBreakdown';
import { FinancialHealthBreakdown } from '@/components/money/FinancialHealthBreakdown';
import {
  computeMonthlyTotals,
  computeDiscretionarySpendingTotals,
  computeMonthlySavingsRate,
  describeTrendDirection,
  type TrendDirection,
} from '@/utils/analytics';
import { formatCategory, formatCurrency } from '@/utils/format';
import { PieChart, TrendingUp } from 'lucide-react';

function savingsRateTakeaway(trend: TrendDirection): string {
  if (trend.direction === 'down') return `Your savings rate has been declining since ${trend.sinceLabel}.`;
  if (trend.direction === 'up') return `Your savings rate has been improving since ${trend.sinceLabel}.`;
  return 'Your savings rate has stayed roughly steady across the months we have.';
}

function gapTakeaway(trend: TrendDirection): string {
  if (trend.direction === 'down') {
    return `The gap between what comes in and what goes out has been narrowing since ${trend.sinceLabel}.`;
  }
  if (trend.direction === 'up') {
    return `The gap between what comes in and what goes out has been widening since ${trend.sinceLabel}.`;
  }
  return 'The gap between what comes in and what goes out has stayed about the same.';
}

/**
 * The deeper financial-picture page (build/redesign pass). Overview gives a
 * glance; this page answers the three questions a customer would actually
 * come here for: how healthy is my position (every backend field, not just
 * the headline two), where does my money go (discretionary categories only
 * — EMI and salary aren't spending choices), and is it getting better or
 * worse, since when. Not a transaction list (Activity) and not a loan view
 * (Loans).
 */
export function MoneyPage() {
  const { customerId } = useDemoCustomer();
  const healthQuery = useFinancialHealth(customerId);
  const transactionsQuery = useTransactions(customerId, 1, 100);

  const transactions = transactionsQuery.data?.items ?? [];
  const monthlyTotals = useMemo(() => computeMonthlyTotals(transactions), [transactions]);
  const discretionaryTotals = useMemo(() => computeDiscretionarySpendingTotals(transactions), [transactions]);
  const topCategory = discretionaryTotals[0];

  const savingsRateSeries = useMemo(
    () =>
      computeMonthlySavingsRate(monthlyTotals).filter(
        (point): point is { month: string; label: string; value: number } => point.value !== null
      ),
    [monthlyTotals]
  );
  const gapSeries = useMemo(() => monthlyTotals.map((m) => ({ label: m.label, value: m.net })), [monthlyTotals]);

  const savingsTrend = describeTrendDirection(savingsRateSeries);
  const gapTrend = describeTrendDirection(gapSeries);

  return (
    <div className="flex flex-col gap-section">
      <div>
        <h1 className="text-xl font-semibold text-ink sm:text-2xl">Your money, in detail</h1>
        <p className="mt-1 text-sm text-muted">
          A closer look at your financial health, where your money goes, and how it&apos;s trending.
        </p>
      </div>

      {/* 1. Full financial health breakdown */}
      <section className="flex flex-col gap-base">
        <SectionHeading title="How healthy is my financial position?" />
        {healthQuery.isLoading ? (
          <CardSkeleton lines={5} />
        ) : healthQuery.isError ? (
          <ErrorState
            title="We couldn't load your financial health."
            error={healthQuery.error}
            onRetry={() => healthQuery.refetch()}
          />
        ) : (
          <FinancialHealthBreakdown health={healthQuery.data!} />
        )}
      </section>

      {/* 2. Where does the money actually go */}
      <section className="flex flex-col gap-base">
        <SectionHeading title="Where does my money go?" description="Spending by category — excludes EMI and salary, since those aren't discretionary choices." />
        {transactionsQuery.isLoading ? (
          <LoadingState message="Loading your activity…" />
        ) : transactionsQuery.isError ? (
          <ErrorState
            title="We couldn't load your transactions."
            error={transactionsQuery.error}
            onRetry={() => transactionsQuery.refetch()}
          />
        ) : discretionaryTotals.length === 0 ? (
          <EmptyState
            icon={<PieChart size={22} />}
            title="No discretionary spending recorded"
            description="Once you have spending outside EMI and salary, a breakdown will appear here."
          />
        ) : discretionaryTotals.length === 1 ? (
          <div className="rounded-lg border border-hairline bg-canvas p-base sm:p-lg">
            <p className="text-sm text-muted">
              There&apos;s only one spending category on record so far — not enough variety yet for a meaningful breakdown.
            </p>
            <div className="mt-3">
              <Metric label={formatCategory(topCategory!.category)} value={formatCurrency(topCategory!.total)} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-body">
              <strong className="font-semibold text-ink">{formatCategory(topCategory!.category)}</strong> was your biggest
              spending category, at {formatCurrency(topCategory!.total)}.
            </p>
            <div className="rounded-lg border border-hairline bg-canvas p-base sm:p-lg">
              <CategoryBreakdown data={discretionaryTotals} />
            </div>
          </div>
        )}
      </section>

      {/* 3. Is it getting better or worse, and since when */}
      <section className="flex flex-col gap-lg">
        <SectionHeading title="Is my situation getting better or worse?" description="How your finances have moved, month by month." />
        {transactionsQuery.isLoading ? (
          <LoadingState message="Loading your activity…" />
        ) : transactionsQuery.isError ? (
          <ErrorState
            title="We couldn't load your transactions."
            error={transactionsQuery.error}
            onRetry={() => transactionsQuery.refetch()}
          />
        ) : monthlyTotals.length === 0 ? (
          <EmptyState
            icon={<TrendingUp size={22} />}
            title="Not enough activity yet"
            description="Trends will appear once there is more transaction history."
          />
        ) : monthlyTotals.length === 1 ? (
          <div className="rounded-lg border border-hairline bg-canvas p-base sm:p-lg">
            <p className="mb-3 text-sm text-muted">
              Only one month of activity is available, so a trend isn&apos;t meaningful yet — here&apos;s this month instead.
            </p>
            <div className="flex gap-lg">
              <Metric label="Income" value={formatCurrency(monthlyTotals[0].income)} />
              <Metric label="Expense" value={formatCurrency(monthlyTotals[0].expense)} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-semibold text-ink">Savings rate over time</h3>
              <p className="text-sm text-body">{savingsRateTakeaway(savingsTrend)}</p>
              <div className="rounded-lg border border-hairline bg-canvas p-base sm:p-lg">
                {savingsRateSeries.length >= 2 ? (
                  <SavingsRateChart data={savingsRateSeries} datasetKey={customerId} />
                ) : (
                  <p className="text-sm text-muted">Not enough months with a calculable savings rate yet.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-base font-semibold text-ink">Income vs. expenses</h3>
              <p className="text-sm text-body">{gapTakeaway(gapTrend)}</p>
              <div className="rounded-lg border border-hairline bg-canvas p-base sm:p-lg">
                <TrendChart data={monthlyTotals} datasetKey={customerId} />
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
