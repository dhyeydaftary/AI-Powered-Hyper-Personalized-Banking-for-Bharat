import { ArrowRight } from 'lucide-react';
import type { Decision } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { getDecisionTone } from '@/utils/decisionCopy';
import { getReasonHeadlines } from '@/utils/reasonCodes';
import { cn } from '@/utils/cn';

interface DecisionComparisonBannerProps {
  currentDecision: Decision | null;
  hypotheticalDecision: Decision;
  reducedMotion: boolean;
}

/**
 * The headline of the What-if page: would the bank's overall read on this
 * customer change if they took this loan. This is the real question behind
 * "what would my EMI be" — the decision engine's actual conclusion under the
 * hypothetical scenario — so it gets top billing, not a footnote under a
 * table of ratio deltas.
 */
export function DecisionComparisonBanner({
  currentDecision,
  hypotheticalDecision,
  reducedMotion,
}: DecisionComparisonBannerProps) {
  const hypoTone = getDecisionTone(hypotheticalDecision);
  const currentTone = currentDecision ? getDecisionTone(currentDecision) : null;
  const sameDecision = currentDecision?.decision === hypotheticalDecision.decision;
  const reasonHeadlines = getReasonHeadlines(hypotheticalDecision.reason_codes);

  return (
    <div
      key={hypotheticalDecision.decision_id}
      className={cn(
        'flex flex-col gap-lg rounded-lg border border-hairline bg-canvas p-base sm:p-lg',
        reducedMotion ? 'animate-fade-in' : 'animate-slide-up'
      )}
    >
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Right now</span>
          {currentTone ? (
            <>
              <Badge tone={currentTone.tone}>{currentTone.label}</Badge>
              <p className="text-lg font-semibold text-ink">{currentTone.headline}</p>
            </>
          ) : (
            <p className="text-sm text-muted">We don&apos;t have a current read on your finances yet.</p>
          )}
        </div>

        <div className="flex items-center justify-center text-muted-soft" aria-hidden>
          <ArrowRight size={20} className="hidden sm:block" />
          <ArrowRight size={20} className="rotate-90 sm:hidden" />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">If you take this loan</span>
          <Badge tone={hypoTone.tone}>{hypoTone.label}</Badge>
          <p className="text-lg font-semibold text-ink">{hypoTone.headline}</p>
        </div>
      </div>

      <div className="border-t border-hairline-soft pt-3">
        {sameDecision ? (
          <p className="text-sm text-body">This loan wouldn&apos;t change our overall read on your finances.</p>
        ) : reasonHeadlines.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm text-body">
            {reasonHeadlines.map((headline, i) => (
              <li key={i}>&bull; {headline}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-body">Taking this loan would change our overall read on your finances.</p>
        )}
      </div>
    </div>
  );
}
