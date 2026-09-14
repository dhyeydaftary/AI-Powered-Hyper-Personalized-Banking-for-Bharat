import type { BalanceTrend, FinancialHealth } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { getConfidenceLabel, getConfidenceLevel, getConfidenceDescription } from '@/utils/confidence';
import {
  interpretEmiToIncome,
  interpretSavingsRate,
  interpretExpenseToIncome,
  interpretIncomeStability,
  interpretBalanceTrend,
  type HealthLevel,
} from '@/utils/financialHealthCopy';
import { formatPercent } from '@/utils/format';
import { cn } from '@/utils/cn';

const levelBarClass: Record<HealthLevel, string> = {
  good: 'bg-up',
  watch: 'bg-warn',
  poor: 'bg-down',
  neutral: 'bg-muted-soft',
};

const levelBadgeTone: Record<HealthLevel, 'positive' | 'attention' | 'critical' | 'neutral'> = {
  good: 'positive',
  watch: 'attention',
  poor: 'critical',
  neutral: 'neutral',
};

const confidenceBannerClass: Record<'low' | 'moderate' | 'high', string> = {
  low: 'border-hairline bg-surface-soft',
  moderate: 'border-transparent bg-warn-soft',
  high: 'border-transparent bg-up-soft',
};

function RatioRow({
  label,
  value,
  interpretation,
}: {
  label: string;
  value: number | null;
  interpretation: { text: string; level: HealthLevel };
}) {
  const pct = value === null ? 0 : Math.min(100, Math.max(0, value * 100));
  return (
    <div className="flex flex-col gap-2 py-lg">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="font-mono text-lg font-semibold tabular-nums text-ink">{formatPercent(value)}</span>
      </div>
      {value !== null && (
        <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-strong" aria-hidden>
          <div className={cn('h-full rounded-pill', levelBarClass[interpretation.level])} style={{ width: `${pct}%` }} />
        </div>
      )}
      <p className="text-sm text-muted">{interpretation.text}</p>
    </div>
  );
}

function BalanceTrendRow({ trend }: { trend: BalanceTrend | null }) {
  const info = interpretBalanceTrend(trend);
  return (
    <div className="flex flex-col gap-2 py-lg">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink">Balance trend</span>
        <Badge tone={levelBadgeTone[info.level]}>{info.label}</Badge>
      </div>
      <p className="text-sm text-muted">{info.text}</p>
    </div>
  );
}

/**
 * The Money page's full financial-health breakdown (fix: Money page build).
 * Every one of the seven backend fields gets its own labeled row with a
 * plain-language interpretation — never a bare number — plus a confidence
 * banner up front so a thin-history reading (C1002) doesn't read with the
 * same weight as a well-established one (C1001).
 */
export function FinancialHealthBreakdown({ health }: { health: FinancialHealth }) {
  const confidenceLevel = getConfidenceLevel(health.confidence);

  return (
    <div className="flex flex-col gap-base">
      <div className={cn('rounded-lg border p-base sm:p-lg', confidenceBannerClass[confidenceLevel])}>
        <p className="text-sm font-semibold text-ink">{getConfidenceLabel(health.confidence)} confidence</p>
        <p className="mt-1 text-sm text-body">{getConfidenceDescription(health.confidence, health.history_months)}</p>
      </div>

      <div className="flex flex-col divide-y divide-hairline-soft rounded-lg border border-hairline bg-canvas px-base sm:px-lg">
        <RatioRow label="Savings rate" value={health.savings_rate} interpretation={interpretSavingsRate(health.savings_rate)} />
        <RatioRow
          label="EMI / income"
          value={health.emi_to_income_ratio}
          interpretation={interpretEmiToIncome(health.emi_to_income_ratio)}
        />
        <RatioRow
          label="Expense / income"
          value={health.expense_to_income_ratio}
          interpretation={interpretExpenseToIncome(health.expense_to_income_ratio)}
        />
        <RatioRow
          label="Income stability"
          value={health.income_stability}
          interpretation={interpretIncomeStability(health.income_stability)}
        />
        <BalanceTrendRow trend={health.balance_trend} />
      </div>
    </div>
  );
}
