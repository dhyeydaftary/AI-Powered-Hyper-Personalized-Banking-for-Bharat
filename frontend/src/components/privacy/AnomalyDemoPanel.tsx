import { ArrowRight } from 'lucide-react';
import type { Decision } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { getDecisionTone } from '@/utils/decisionCopy';
import { cn } from '@/utils/cn';

export interface DemoRun {
  id: number;
  decision: Decision;
}

interface AnomalyDemoPanelProps {
  savedAnomalyEnabled: boolean;
  hasUnsavedAnomalyChange: boolean;
  runs: DemoRun[];
  onRun: () => void;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  reducedMotion: boolean;
}

function explainRun(decision: Decision, hadPriorVerify: boolean): string {
  if (decision.decision === 'VERIFY') {
    return 'Anomaly detection is active and flagged the seeded unusual transaction.';
  }
  if (hadPriorVerify) {
    return 'With anomaly detection off, that same transaction is no longer flagged.';
  }
  return 'No verification was triggered for the unusual transaction on this run.';
}

/**
 * The flagship, provably-real interaction on the Privacy page: this calls
 * the actual PUT /consent + POST /analyze endpoints and shows the real
 * decision the backend returned — never a staged or simulated result. Only
 * `anomaly_analysis` gets this treatment because it's the one field the
 * backend's decision logic explicitly branches on (it will never return
 * VERIFY with it off); the other two consent fields don't have an
 * equally guaranteed, visible before/after effect and shouldn't be
 * presented as if they did.
 */
export function AnomalyDemoPanel({
  savedAnomalyEnabled,
  hasUnsavedAnomalyChange,
  runs,
  onRun,
  isPending,
  isError,
  error,
  reducedMotion,
}: AnomalyDemoPanelProps) {
  const latest = runs[runs.length - 1] ?? null;
  const previous = runs.length >= 2 ? runs[runs.length - 2] : null;

  const latestTone = latest ? getDecisionTone(latest.decision) : null;
  const previousTone = previous ? getDecisionTone(previous.decision) : null;
  const explanation = latest ? explainRun(latest.decision, previous?.decision.decision === 'VERIFY') : null;

  return (
    <section className="rounded-lg border border-hairline bg-canvas p-base sm:p-lg">
      <h2 className="text-sm font-semibold text-ink">See what changes when anomaly detection is off</h2>
      <p className="mt-1 text-sm text-muted">
        This customer has a seeded unusual transaction. Toggle anomaly detection above and save, then run the
        analysis below to see the decision actually change — this isn&apos;t simulated in the frontend, it&apos;s
        enforced by the backend&apos;s consent check. Turn it back on and run again to see the flag return.
      </p>

      <div className="mt-base flex flex-wrap items-center gap-3">
        <Badge tone={savedAnomalyEnabled ? 'positive' : 'neutral'}>
          Saved setting: anomaly detection {savedAnomalyEnabled ? 'on' : 'off'}
        </Badge>
        <Button variant="outline" size="sm" onClick={onRun} disabled={isPending}>
          See what changes
        </Button>
      </div>

      {hasUnsavedAnomalyChange && (
        <p className="mt-2 text-xs text-warn">
          You changed anomaly detection above but haven&apos;t saved yet — save it first so this demo reflects the
          new setting.
        </p>
      )}

      {isPending && <LoadingState message="Analyzing your financial context…" className="mt-3" />}
      {isError && <ErrorState title="We couldn't run the analysis." error={error} onRetry={onRun} />}

      {latest && latestTone && (
        <div
          key={latest.id}
          className={cn('mt-base rounded-md bg-surface-soft p-base', reducedMotion ? 'animate-fade-in' : 'animate-slide-up')}
        >
          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
            {previous && previousTone && (
              <>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">Before</span>
                  <Badge tone={previousTone.tone}>{previousTone.label}</Badge>
                </div>
                <ArrowRight size={18} className="hidden text-muted-soft sm:block" aria-hidden />
              </>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                {previous ? 'After' : 'Result'}
              </span>
              <Badge tone={latestTone.tone}>{latestTone.label}</Badge>
              <span className="text-sm text-ink">{latestTone.headline}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">{explanation}</p>
        </div>
      )}
    </section>
  );
}
