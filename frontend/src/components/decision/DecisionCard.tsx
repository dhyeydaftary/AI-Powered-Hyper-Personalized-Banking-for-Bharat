import { useMemo, useState } from 'react';
import type { Decision, Transaction } from '@/types';
import {
  getDecisionTone,
  getDecisionSupportingCopy,
  getVerifyNarrative,
  getVerifyWhyItMatters,
  getVerifyAmountInterpretation,
  getWhyItMattersForDecision,
} from '@/utils/decisionCopy';
import { getReadableSignals } from '@/utils/signals';
import { findMatchedTransaction } from '@/utils/verifyTransaction';
import { ConfidenceBadge } from './ConfidenceBadge';
import { FeedbackButtons } from './FeedbackButtons';
import { VerifyActionButtons } from './VerifyActionButtons';
import { DecisionDetailDrawer } from './DecisionDetailDrawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const toneBarClass = {
  positive: 'bg-up',
  attention: 'bg-warn',
  critical: 'bg-down',
  neutral: 'bg-muted-soft',
} as const;

const toneBadge = {
  positive: 'positive',
  attention: 'attention',
  critical: 'critical',
  neutral: 'neutral',
} as const;

interface DecisionCardProps {
  customerId: string;
  decision: Decision;
  historyMonths: number;
  /** The customer's fetched transactions, used only to ground a VERIFY
   * decision's plain-language explanation in the real transaction it's
   * about (merchant, amount, whether it's the largest on record) — never
   * to re-derive or override the decision itself. */
  transactions?: Transaction[];
}

/**
 * The primary AI insight surface (Section 20). Renders whichever of the
 * four decision states the backend actually returned — this component
 * never re-derives or overrides the decision, it only presents it.
 *
 * This product is built for customers who may not be financially fluent,
 * so every state gets a plain-language sentence describing what actually
 * happened, a one-line reason it matters, and every number shown carries
 * a one-line interpretation rather than being left bare. VERIFY gets a
 * transaction-specific narrative and real "This was me" / "I don't
 * recognize this" actions instead of a generic "we noticed something
 * unusual" bullet.
 */
export function DecisionCard({ customerId, decision, historyMonths, transactions = [] }: DecisionCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const tone = getDecisionTone(decision);
  const isVerify = decision.decision === 'VERIFY';

  const matchedTransaction = useMemo(
    () => (isVerify ? findMatchedTransaction(decision, transactions) : null),
    [isVerify, decision, transactions]
  );

  const narrative = isVerify ? getVerifyNarrative(decision, matchedTransaction) : getDecisionSupportingCopy(decision);
  const whyItMatters = isVerify
    ? getVerifyWhyItMatters(matchedTransaction, transactions)
    : getWhyItMattersForDecision(decision);

  const signals = useMemo(() => {
    const entries = getReadableSignals(decision.signals);
    if (!isVerify) return entries;
    // Ground the bare "unusual_amount" number in a real comparison rather
    // than leaving it as a number with no context.
    return entries.map((entry) =>
      entry.key === 'unusual_amount'
        ? { ...entry, interpretation: getVerifyAmountInterpretation(matchedTransaction, transactions) }
        : entry
    );
  }, [decision.signals, isVerify, matchedTransaction, transactions]);

  return (
    <div className="flex overflow-hidden rounded-lg border border-hairline bg-canvas">
      <div className={cn('w-1 shrink-0', toneBarClass[tone.tone])} aria-hidden />
      <div className="flex flex-1 flex-col gap-3 p-base sm:p-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone={toneBadge[tone.tone]}>{tone.label}</Badge>
          <ConfidenceBadge confidence={decision.confidence} historyMonths={historyMonths} />
        </div>

        <div>
          <h3 className="text-base font-semibold text-ink sm:text-lg">{tone.headline}</h3>
          <p className="mt-1 text-sm text-body">{narrative}</p>
          {whyItMatters && <p className="mt-1 text-sm text-muted">{whyItMatters}</p>}
        </div>

        {signals.length > 0 && (
          <dl className="flex flex-col gap-3 border-t border-hairline-soft pt-3 sm:flex-row sm:flex-wrap sm:gap-x-lg sm:gap-y-3">
            {signals.map((entry) => (
              <div key={entry.label} className="flex flex-col">
                <dt className="text-xs text-muted">{entry.label}</dt>
                <dd className="font-mono text-sm font-medium tabular-nums text-ink">{entry.value}</dd>
                {entry.interpretation && <p className="mt-0.5 max-w-[16rem] text-xs text-muted-soft">{entry.interpretation}</p>}
              </div>
            ))}
          </dl>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <Button variant="outline" size="sm" onClick={() => setDetailOpen(true)}>
            See details
          </Button>
          {isVerify ? (
            <VerifyActionButtons customerId={customerId} decisionId={decision.decision_id} />
          ) : (
            <FeedbackButtons customerId={customerId} decisionId={decision.decision_id} />
          )}
        </div>
      </div>

      <DecisionDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        decision={decision}
        historyMonths={historyMonths}
        transactions={transactions}
      />
    </div>
  );
}
