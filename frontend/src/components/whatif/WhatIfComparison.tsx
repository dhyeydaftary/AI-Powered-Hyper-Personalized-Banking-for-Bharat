import type { FinancialHealth } from '@/types';
import { ConfidenceBadge } from '@/components/decision/ConfidenceBadge';
import {
  interpretEmiToIncome,
  interpretSavingsRate,
  interpretExpenseToIncome,
  interpretIncomeStability,
  interpretBalanceTrend,
  type HealthLevel,
} from '@/utils/financialHealthCopy';
import { formatPercent, formatPercentPoints } from '@/utils/format';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { cn } from '@/utils/cn';

const levelBarClass: Record<HealthLevel, string> = {
  good: 'bg-up',
  watch: 'bg-warn',
  poor: 'bg-down',
  neutral: 'bg-muted-soft',
};

function toPct(value: number | null): number {
  return value === null ? 0 : Math.min(100, Math.max(0, value * 100));
}

function ComparisonMetricRow({
  label,
  current,
  hypothetical,
  interpret,
  reducedMotion,
}: {
  label: string;
  current: number | null;
  hypothetical: number | null;
  interpret: (value: number | null) => { text: string; level: HealthLevel };
  reducedMotion: boolean;
}) {
  const animatedHypothetical = useAnimatedNumber(hypothetical, reducedMotion);
  const interpretation = interpret(hypothetical);
  const delta = current !== null && hypothetical !== null ? hypothetical - current : null;

  return (
    <div className="flex flex-col gap-2 py-lg">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm tabular-nums text-muted">{formatPercent(current)}</span>
          <span className="text-muted-soft" aria-hidden>
            &rarr;
          </span>
          <span className="font-mono text-lg font-semibold tabular-nums text-ink">
            {formatPercent(animatedHypothetical)}
          </span>
        </div>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-pill bg-surface-strong" aria-hidden>
        {current !== null && (
          <div className="absolute inset-y-0 left-0 rounded-pill bg-muted-soft/70" style={{ width: `${toPct(current)}%` }} />
        )}
        {hypothetical !== null && (
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-pill',
              levelBarClass[interpretation.level],
              !reducedMotion && 'transition-[width] duration-500 ease-out'
            )}
            style={{ width: `${toPct(hypothetical)}%` }}
          />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="text-sm text-muted">{interpretation.text}</p>
        {delta !== null && Math.abs(delta) >= 0.005 && (
          <span className="text-xs font-medium text-muted-soft">{formatPercentPoints(delta)} vs. now</span>
        )}
      </div>
    </div>
  );
}

function BalanceTrendComparisonRow({
  current,
  hypothetical,
}: {
  current: FinancialHealth['balance_trend'];
  hypothetical: FinancialHealth['balance_trend'];
}) {
  const currentInfo = interpretBalanceTrend(current);
  const hypoInfo = interpretBalanceTrend(hypothetical);

  return (
    <div className="flex flex-col gap-2 py-lg">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">Balance trend</span>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">{currentInfo.label}</span>
          <span className="text-muted-soft" aria-hidden>
            &rarr;
          </span>
          <span className="font-semibold text-ink">{hypoInfo.label}</span>
        </div>
      </div>
      <p className="text-sm text-muted">{hypoInfo.text}</p>
    </div>
  );
}

interface WhatIfComparisonProps {
  current: FinancialHealth;
  hypothetical: FinancialHealth;
  reducedMotion: boolean;
}

/**
 * The full current-vs-hypothetical breakdown, field for field, each paired
 * with the same plain-language interpretation used on the Money page — this
 * product is built for customers who may not be financially fluent, so a
 * bare ratio is never shown on its own. Confidence is read directly off
 * each side's own response rather than assumed, so a thin-file customer's
 * hypothetical reading honestly inherits the same low confidence as their
 * real data instead of appearing more certain than it is.
 */
export function WhatIfComparison({ current, hypothetical, reducedMotion }: WhatIfComparisonProps) {
  return (
    <div className="flex flex-col gap-base">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-surface-soft p-sm">
          <span className="text-xs font-medium text-muted">Now</span>
          <ConfidenceBadge confidence={current.confidence} historyMonths={current.history_months} />
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary-soft/30 p-sm">
          <span className="text-xs font-medium text-primary">If you take this loan</span>
          <ConfidenceBadge confidence={hypothetical.confidence} historyMonths={hypothetical.history_months} />
        </div>
      </div>

      <div className="flex flex-col divide-y divide-hairline-soft rounded-lg border border-hairline bg-canvas px-base sm:px-lg">
        <ComparisonMetricRow
          label="Savings rate"
          current={current.savings_rate}
          hypothetical={hypothetical.savings_rate}
          interpret={interpretSavingsRate}
          reducedMotion={reducedMotion}
        />
        <ComparisonMetricRow
          label="EMI / income"
          current={current.emi_to_income_ratio}
          hypothetical={hypothetical.emi_to_income_ratio}
          interpret={interpretEmiToIncome}
          reducedMotion={reducedMotion}
        />
        <ComparisonMetricRow
          label="Expense / income"
          current={current.expense_to_income_ratio}
          hypothetical={hypothetical.expense_to_income_ratio}
          interpret={interpretExpenseToIncome}
          reducedMotion={reducedMotion}
        />
        <ComparisonMetricRow
          label="Income stability"
          current={current.income_stability}
          hypothetical={hypothetical.income_stability}
          interpret={interpretIncomeStability}
          reducedMotion={reducedMotion}
        />
        <BalanceTrendComparisonRow current={current.balance_trend} hypothetical={hypothetical.balance_trend} />
      </div>
    </div>
  );
}
