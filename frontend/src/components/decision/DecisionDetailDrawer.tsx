import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { MiniTrendChart, type MiniTrendPoint } from '@/components/charts/MiniTrendChart';
import { VerifyActionButtons } from './VerifyActionButtons';
import type { Decision, Transaction } from '@/types';
import { getDecisionTone, getSuggestedAction } from '@/utils/decisionCopy';
import { getReasonCodeCopy } from '@/utils/reasonCodes';
import { getReadableSignals } from '@/utils/signals';
import { getConfidenceLabel } from '@/utils/confidence';
import { findMatchedTransaction } from '@/utils/verifyTransaction';
import {
  computeMonthlyTotals,
  computeMonthlySavingsRate,
  computeMonthlyExpenseRatio,
  computeMonthlyEmiRatio,
} from '@/utils/analytics';
import { formatCurrency, formatDate, formatDateShort, formatCategory, formatPercent } from '@/utils/format';

interface DecisionDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: Decision;
  historyMonths: number;
  /** Used only to surface the real transaction a VERIFY decision refers to
   * and to compute a genuine month-by-month trend where the underlying
   * signal is a trend, rather than showing two bare endpoint numbers. */
  transactions?: Transaction[];
}

const toneBadge = { positive: 'positive', attention: 'attention', critical: 'critical', neutral: 'neutral' } as const;

function toChartPoints(
  points: { label: string; value: number | null }[],
  highlightLabel?: string
): MiniTrendPoint[] {
  return points
    .filter((p): p is { label: string; value: number } => p.value !== null)
    .map((p) => ({ label: p.label, value: p.value, highlight: p.label === highlightLabel }));
}

/** Decision detail (Section 26): decision, why, supporting signal, suggested
 * action, confidence — translated through the reason-code map, never raw.
 *
 * Beyond what the summary card already shows, this adds: the actual
 * transaction a VERIFY decision is about (with a link into Activity), a
 * real month-by-month trend chart where the driving signal is a trend
 * rather than a single anomaly, working "This was me" / "I don't
 * recognize this" actions for VERIFY, and confidence shown together with
 * its basis.
 */
export function DecisionDetailDrawer({ open, onOpenChange, decision, historyMonths, transactions = [] }: DecisionDetailDrawerProps) {
  const tone = getDecisionTone(decision);
  const suggestedAction = getSuggestedAction(decision);
  const signals = getReadableSignals(decision.signals);
  const isVerify = decision.decision === 'VERIFY';

  const matchedTransaction = useMemo(
    () => (isVerify ? findMatchedTransaction(decision, transactions) : null),
    [isVerify, decision, transactions]
  );

  const monthlyTotals = useMemo(() => computeMonthlyTotals(transactions), [transactions]);

  const trend = useMemo(() => {
    if (isVerify) {
      const recentDebits = [...transactions]
        .filter((tx) => tx.type === 'DEBIT')
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-8);
      if (recentDebits.length < 2) return null;
      return {
        title: 'Recent spending, leading up to this transaction',
        points: recentDebits.map((tx) => ({
          label: formatDateShort(tx.date),
          value: tx.amount,
          highlight: matchedTransaction?.transaction_id === tx.transaction_id,
        })),
        valueFormatter: (v: number) => formatCurrency(v),
      };
    }
    if (decision.reason_codes.includes('DECLINING_SAVINGS')) {
      const points = toChartPoints(computeMonthlySavingsRate(monthlyTotals));
      if (points.length < 2) return null;
      return { title: 'Savings rate over time', points, valueFormatter: (v: number) => formatPercent(v, 0) };
    }
    if (decision.reason_codes.includes('RISING_EXPENSE_RATIO')) {
      const points = toChartPoints(computeMonthlyExpenseRatio(monthlyTotals));
      if (points.length < 2) return null;
      return { title: 'Expense / income over time', points, valueFormatter: (v: number) => formatPercent(v, 0) };
    }
    if (decision.reason_codes.includes('HIGH_EMI_BURDEN')) {
      const points = toChartPoints(computeMonthlyEmiRatio(transactions));
      if (points.length < 2) return null;
      return { title: 'EMI / income over time', points, valueFormatter: (v: number) => formatPercent(v, 0) };
    }
    return null;
  }, [decision.reason_codes, isVerify, matchedTransaction, monthlyTotals, transactions]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={tone.headline}>
      <div className="flex flex-col gap-lg">
        <div className="flex items-center gap-2">
          <Badge tone={toneBadge[tone.tone]}>{tone.label}</Badge>
          <span className="text-xs text-muted">{formatDate(decision.timestamp.split('T')[0])}</span>
        </div>

        {matchedTransaction && (
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">The transaction</h4>
            <div className="rounded-md bg-surface-soft p-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-ink">{matchedTransaction.merchant}</span>
                <span className="font-mono text-sm font-medium tabular-nums text-ink">
                  {formatCurrency(matchedTransaction.amount)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {formatCategory(matchedTransaction.category)} &middot; {formatDate(matchedTransaction.date)}
              </p>
            </div>
            <Link to="/transactions" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
              See it in your activity
            </Link>
          </section>
        )}

        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Why</h4>
          <ul className="flex flex-col gap-3">
            {decision.reason_codes.map((code) => {
              const copy = getReasonCodeCopy(code);
              return (
                <li key={code}>
                  <p className="text-sm font-medium text-ink">{copy.headline}</p>
                  {copy.detail && <p className="mt-0.5 text-sm text-muted">{copy.detail}</p>}
                </li>
              );
            })}
          </ul>
        </section>

        {trend && (
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{trend.title}</h4>
            <div className="rounded-md border border-hairline-soft p-sm">
              <MiniTrendChart data={trend.points} valueFormatter={trend.valueFormatter} />
            </div>
          </section>
        )}

        {signals.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Supporting signals</h4>
            <dl className="grid grid-cols-2 gap-3">
              {signals.map((entry) => (
                <div key={entry.label} className="rounded-md bg-surface-soft p-sm">
                  <dt className="text-xs text-muted">{entry.label}</dt>
                  <dd className="font-mono text-base font-medium tabular-nums text-ink">{entry.value}</dd>
                  {entry.interpretation && <p className="mt-0.5 text-xs text-muted-soft">{entry.interpretation}</p>}
                </div>
              ))}
            </dl>
          </section>
        )}

        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {isVerify ? 'What you can do' : 'Suggested next step'}
          </h4>
          {isVerify ? (
            <VerifyActionButtons customerId={decision.customer_id} decisionId={decision.decision_id} />
          ) : (
            suggestedAction && <p className="text-sm text-ink">{suggestedAction}</p>
          )}
        </section>

        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Confidence</h4>
          <p className="text-sm text-ink">
            {getConfidenceLabel(decision.confidence)} confidence, based on {historyMonths}{' '}
            {historyMonths === 1 ? 'month' : 'months'} of financial activity.
          </p>
        </section>
      </div>
    </Drawer>
  );
}
