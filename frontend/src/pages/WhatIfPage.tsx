import { useState, type FormEvent } from 'react';
import { Calculator } from 'lucide-react';
import { useDemoCustomer } from '@/state/demo-customer-context';
import { useSimulateMutation } from '@/hooks/useSimulate';
import { useLatestDecision } from '@/hooks/useDecision';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoanPresetPicker } from '@/components/whatif/LoanPresetPicker';
import { DecisionComparisonBanner } from '@/components/whatif/DecisionComparisonBanner';
import { WhatIfComparison } from '@/components/whatif/WhatIfComparison';
import { isDecisionMoreSevere } from '@/utils/decisionCopy';
import type { LoanPreset } from '@/utils/loanPresets';
import { cn } from '@/utils/cn';

const MIN_PRINCIPAL = 10000;
const MAX_TENURE_MONTHS = 120;

export function WhatIfPage() {
  const { customerId } = useDemoCustomer();
  const mutation = useSimulateMutation(customerId);
  const decisionQuery = useLatestDecision(customerId);
  const reducedMotion = usePrefersReducedMotion();

  const [principal, setPrincipal] = useState('300000');
  const [rate, setRate] = useState('12');
  const [tenure, setTenure] = useState('36');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const runSimulation = (overrides?: { principal?: number; tenure?: number }) => {
    mutation.mutate({
      loan: {
        principal: overrides?.principal ?? Number(principal),
        annual_interest_rate: Number(rate),
        tenure_months: overrides?.tenure ?? Number(tenure),
      },
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    runSimulation();
  };

  const handleSelectPreset = (preset: LoanPreset) => {
    setSelectedPresetId(preset.id);
    setRate(String(preset.rate));
    setTenure(String(preset.tenureDefaultMonths));
  };

  const result = mutation.data;
  const currentDecision = decisionQuery.data ?? null;

  const currentPrincipal = Number(principal);
  const currentTenure = Number(tenure);
  const smallerPrincipal = Math.max(MIN_PRINCIPAL, Math.round((currentPrincipal * 0.8) / 1000) * 1000);
  const longerTenure = Math.min(MAX_TENURE_MONTHS, Math.round(currentTenure * 1.5));

  const looksWorse =
    !!result && !!currentDecision && isDecisionMoreSevere(currentDecision.decision, result.decision.decision);

  const trySmallerAmount = () => {
    setPrincipal(String(smallerPrincipal));
    runSimulation({ principal: smallerPrincipal });
  };

  const tryLongerTenure = () => {
    setTenure(String(longerTenure));
    runSimulation({ tenure: longerTenure });
  };

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
          <Calculator size={22} className="text-primary" /> What-if simulator
        </h1>
        <p className="mt-1 text-sm text-muted">
          Explore how a hypothetical loan could change your financial picture — and whether we&apos;d still call it
          okay — without changing anything real.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-hairline bg-canvas p-base sm:p-lg">
        <LoanPresetPicker selectedId={selectedPresetId} onSelect={handleSelectPreset} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Loan amount (₹)</span>
            <Input
              type="number"
              min={1000}
              max={10000000}
              step={1000}
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Annual interest rate (%)</span>
            <Input
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={rate}
              onChange={(e) => {
                setRate(e.target.value);
                setSelectedPresetId(null);
              }}
              required
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Tenure (months)</span>
            <Input
              type="number"
              min={1}
              max={360}
              value={tenure}
              onChange={(e) => {
                setTenure(e.target.value);
                setSelectedPresetId(null);
              }}
              required
            />
          </label>
        </div>

        <div>
          <Button type="submit" disabled={mutation.isPending}>
            Run simulation
          </Button>
        </div>
      </form>

      {mutation.isPending && <LoadingState message="Running simulation…" />}
      {mutation.isError && (
        <ErrorState title="We couldn't run this simulation." error={mutation.error} onRetry={() => runSimulation()} />
      )}

      {result && (
        <div className={cn('flex flex-col gap-lg', reducedMotion ? 'animate-fade-in' : 'animate-slide-up')}>
          <Alert tone="neutral" title="This is just an exploration — nothing has changed yet.">
            These numbers are hypothetical only. Your real accounts, loans, and financial health are unchanged.
          </Alert>

          <DecisionComparisonBanner
            currentDecision={currentDecision}
            hypotheticalDecision={result.decision}
            reducedMotion={reducedMotion}
          />

          {looksWorse && (smallerPrincipal < currentPrincipal || longerTenure > currentTenure) && (
            <div className="flex flex-col gap-3 rounded-lg border border-hairline bg-surface-soft p-base sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-body">
                This version of the loan would draw more attention than your current situation. Want to try one that
                might not?
              </p>
              <div className="flex flex-wrap gap-2">
                {smallerPrincipal < currentPrincipal && (
                  <Button variant="outline" size="sm" onClick={trySmallerAmount} disabled={mutation.isPending}>
                    Try a smaller amount
                  </Button>
                )}
                {longerTenure > currentTenure && (
                  <Button variant="outline" size="sm" onClick={tryLongerTenure} disabled={mutation.isPending}>
                    Try a longer tenure
                  </Button>
                )}
              </div>
            </div>
          )}

          <WhatIfComparison current={result.current} hypothetical={result.hypothetical} reducedMotion={reducedMotion} />
        </div>
      )}
    </div>
  );
}
