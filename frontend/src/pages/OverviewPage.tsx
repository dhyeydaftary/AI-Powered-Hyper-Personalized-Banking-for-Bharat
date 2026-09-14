import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoCustomer } from '@/state/demo-customer-context';
import { useCustomer } from '@/hooks/useCustomer';
import { useFinancialHealth } from '@/hooks/useFinancialHealth';
import { useLatestDecision, useAnalyzeMutation } from '@/hooks/useDecision';
import { useTransactions } from '@/hooks/useTransactions';
import { useLoans } from '@/hooks/useLoans';
import { DecisionCard } from '@/components/decision/DecisionCard';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { TransactionDetailDialog } from '@/components/transactions/TransactionDetailDialog';
import { TrendChart } from '@/components/charts/TrendChart';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Metric } from '@/components/ui/Metric';
import { LoadingState, CardSkeleton, Skeleton } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { computeMonthlyTotals, computeAvailableBalance } from '@/utils/analytics';
import { formatCurrency, formatPercent, formatMonthYear } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Transaction } from '@/types';
import { Receipt, Landmark, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const BALANCE_TREND_META = {
  IMPROVING: { label: 'Improving', colorClass: 'text-up', Icon: ArrowUp },
  DECLINING: { label: 'Declining', colorClass: 'text-down', Icon: ArrowDown },
  STABLE: { label: 'Stable', colorClass: 'text-muted', Icon: Minus },
} as const;

export function OverviewPage() {
  const { customerId } = useDemoCustomer();
  const customerQuery = useCustomer(customerId);
  const healthQuery = useFinancialHealth(customerId);
  const decisionQuery = useLatestDecision(customerId);
  const analyzeMutation = useAnalyzeMutation(customerId);
  const transactionsQuery = useTransactions(customerId, 1, 100);
  const loansQuery = useLoans(customerId);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // If no decision has been computed yet for this customer, run the
  // analysis pipeline once so the insight surface has something real to
  // show — this never fabricates a decision client-side, it just triggers
  // the same POST /analyze a customer action would.
  useEffect(() => {
    if (decisionQuery.isSuccess && decisionQuery.data === null && analyzeMutation.isIdle) {
      analyzeMutation.mutate({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decisionQuery.isSuccess, decisionQuery.data, customerId]);

  const transactions = transactionsQuery.data?.items ?? [];
  const monthlyTotals = useMemo(() => computeMonthlyTotals(transactions), [transactions]);
  const latestMonth = monthlyTotals[monthlyTotals.length - 1];
  const previousMonth = monthlyTotals[monthlyTotals.length - 2];

  // The backend has no ledger-balance field, only a `balance_trend` signal —
  // so "available balance" here is a derived net of the transactions we've
  // actually fetched (a real aggregate of real amounts, not a fabricated
  // figure), captioned accordingly rather than presented as an authoritative
  // core-banking balance.
  const availableBalance = useMemo(() => computeAvailableBalance(transactions), [transactions]);
  const balanceTrendMeta = healthQuery.data?.balance_trend
    ? BALANCE_TREND_META[healthQuery.data.balance_trend as keyof typeof BALANCE_TREND_META]
    : undefined;

  const latestTxDate = transactions[0]?.date;
  const pictureMonthLabel = latestTxDate ? formatMonthYear(latestTxDate) : '';

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = customerQuery.data?.name.split(' ')[0];

  const effectiveDecision = analyzeMutation.data?.decision ?? decisionQuery.data;
  const decisionIsLoading =
    decisionQuery.isLoading || (decisionQuery.data === null && (analyzeMutation.isIdle || analyzeMutation.isPending));

  const totalEmi = (loansQuery.data ?? []).reduce((sum, loan) => sum + loan.monthly_emi, 0);

  return (
    <div className="flex flex-col gap-xl">
      <div>
        <h1 className="text-xl font-semibold text-ink sm:text-2xl">
          {greeting}
          {firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {pictureMonthLabel ? `Here's your financial picture for ${pictureMonthLabel}.` : "Here's your financial picture."}
        </p>
      </div>

      <section>
        <SectionHeading title="Financial snapshot" />
        {healthQuery.isLoading || customerQuery.isLoading ? (
          <div className="flex flex-col gap-lg rounded-lg border border-hairline bg-canvas p-base sm:flex-row sm:items-start sm:justify-between sm:p-lg">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} lines={1} />
              ))}
            </div>
          </div>
        ) : healthQuery.isError || customerQuery.isError ? (
          <ErrorState
            title="We couldn't load your financial snapshot."
            error={healthQuery.error ?? customerQuery.error}
            onRetry={() => {
              healthQuery.refetch();
              customerQuery.refetch();
            }}
          />
        ) : (
          <div className="flex flex-col gap-lg rounded-lg border border-hairline bg-canvas p-base sm:flex-row sm:items-start sm:justify-between sm:p-lg">
            {/* Dominant figure: everything else on this page is secondary to this. */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">Available balance</span>
              <span className="font-mono text-3xl font-semibold tabular-nums text-ink sm:text-4xl">
                {formatCurrency(availableBalance)}
              </span>
              {balanceTrendMeta && (
                <span className={cn('flex items-center gap-1 text-xs font-medium', balanceTrendMeta.colorClass)}>
                  <balanceTrendMeta.Icon size={12} /> {balanceTrendMeta.label}
                </span>
              )}
              <span className="text-xs text-muted-soft">Net of transactions on record</span>
            </div>

            {/* Secondary figures, each in its own box so a trend line is
                unambiguously attached to the one metric it describes. */}
            <div className="grid grid-cols-2 gap-3 sm:min-w-[260px] sm:gap-3">
              <div className="rounded-md bg-surface-soft p-3">
                <Metric size="sm" label="Monthly income" value={formatCurrency(customerQuery.data!.monthly_income)} />
              </div>
              <div className="rounded-md bg-surface-soft p-3">
                <Metric
                  size="sm"
                  label="Monthly spending"
                  value={latestMonth ? formatCurrency(latestMonth.expense) : '—'}
                  trend={
                    latestMonth && previousMonth
                      ? {
                          direction: latestMonth.expense >= previousMonth.expense ? 'up' : 'down',
                          isGood: latestMonth.expense < previousMonth.expense,
                          label: `${formatCurrency(Math.abs(latestMonth.expense - previousMonth.expense))} vs last month`,
                        }
                      : undefined
                  }
                  unavailableReason={!latestMonth ? 'No spending recorded yet' : undefined}
                />
              </div>
              <div className="rounded-md bg-surface-soft p-3">
                <Metric
                  size="sm"
                  label="Savings rate"
                  value={formatPercent(healthQuery.data!.savings_rate)}
                  unavailableReason={healthQuery.data!.savings_rate === null ? 'Not enough history yet' : undefined}
                />
              </div>
              <div className="rounded-md bg-surface-soft p-3">
                <Metric
                  size="sm"
                  label="EMI obligations"
                  value={totalEmi > 0 ? formatCurrency(totalEmi) : '—'}
                  unavailableReason={totalEmi === 0 ? 'No active loans' : undefined}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      <section>
        <SectionHeading title="A change worth noticing" description="Based on your authorized financial data." />
        {decisionIsLoading ? (
          <LoadingState message="Analyzing your financial context…" />
        ) : decisionQuery.isError ? (
          <ErrorState title="We couldn't load your latest insight." error={decisionQuery.error} onRetry={() => decisionQuery.refetch()} />
        ) : analyzeMutation.isError ? (
          <ErrorState title="We couldn't run your analysis." error={analyzeMutation.error} onRetry={() => analyzeMutation.mutate({})} />
        ) : effectiveDecision ? (
          <DecisionCard
            customerId={customerId}
            decision={effectiveDecision}
            historyMonths={healthQuery.data?.history_months ?? 0}
            transactions={transactions}
          />
        ) : (
          <EmptyState title="No insight yet" description="Once we have more activity, insights will appear here." />
        )}
      </section>

      {monthlyTotals.length >= 2 && (
        <section>
          <SectionHeading
            title="Money movement"
            description="Income and expenses over time."
            action={
              <Link to="/money" className="text-sm font-medium text-primary hover:underline">
                See details
              </Link>
            }
          />
          <div className="rounded-lg border border-hairline bg-canvas p-base sm:p-lg">
            <TrendChart data={monthlyTotals} datasetKey={customerId} />
          </div>
        </section>
      )}

      <section>
        <SectionHeading title="Upcoming obligations" />
        {loansQuery.isLoading ? (
          <LoadingState message="Loading your loans…" />
        ) : loansQuery.isError ? (
          <ErrorState title="We couldn't load your loans." error={loansQuery.error} onRetry={() => loansQuery.refetch()} />
        ) : (loansQuery.data ?? []).length === 0 ? (
          <EmptyState icon={<Landmark size={22} />} title="No upcoming obligations" description="You have no active loans on file." />
        ) : (
          <div className="flex flex-col gap-2">
            {loansQuery.data!.map((loan) => (
              <div key={loan.loan_id} className="flex items-center justify-between rounded-lg border border-hairline bg-canvas p-base">
                <div>
                  <p className="text-sm font-medium text-ink">Monthly EMI</p>
                  <p className="text-xs text-muted">{loan.remaining_months} months remaining</p>
                </div>
                <p className="font-mono text-base font-medium tabular-nums text-ink">{formatCurrency(loan.monthly_emi)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeading
          title="Recent activity"
          action={
            <Link to="/transactions" className="text-sm font-medium text-primary hover:underline">
              See all
            </Link>
          }
        />
        {transactionsQuery.isLoading ? (
          <LoadingState message="Loading your transactions…" />
        ) : transactionsQuery.isError ? (
          <ErrorState title="We couldn't load your transactions." error={transactionsQuery.error} onRetry={() => transactionsQuery.refetch()} />
        ) : transactions.length === 0 ? (
          <EmptyState icon={<Receipt size={22} />} title="No recent transactions" description="There are no transactions to display for this period." />
        ) : (
          <div className="rounded-lg border border-hairline bg-canvas p-1">
            {transactions.slice(0, 5).map((tx) => (
              <TransactionRow key={tx.transaction_id} transaction={tx} onClick={() => setSelectedTx(tx)} />
            ))}
          </div>
        )}
      </section>

      <TransactionDetailDialog transaction={selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)} />
    </div>
  );
}
