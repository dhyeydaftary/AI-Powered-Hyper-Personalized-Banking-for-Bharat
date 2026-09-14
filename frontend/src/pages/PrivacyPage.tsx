import { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useDemoCustomer } from '@/state/demo-customer-context';
import { useConsent, useUpdateConsent } from '@/hooks/useConsent';
import { useAnalyzeMutation } from '@/hooks/useDecision';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SectionHeading } from '@/components/common/SectionHeading';
import { AnomalyDemoPanel, type DemoRun } from '@/components/privacy/AnomalyDemoPanel';
import { LanguageAvailabilityPreview } from '@/components/privacy/LanguageAvailabilityPreview';
import { AuditHistoryList } from '@/components/privacy/AuditHistoryList';
import { useToast } from '@/state/toast-context';
import type { Consent } from '@/types';

const FIELDS: Array<{ key: keyof Consent; title: string; description: string }> = [
  {
    key: 'anomaly_analysis',
    title: 'Anomaly detection',
    description:
      "Lets us notice transactions that look unusual for you and check with you before treating them as normal. Turning this off means we won't be able to flag anything unusual on your account.",
  },
  {
    key: 'behavioral_trend_analysis',
    title: 'Spending pattern analysis',
    description:
      "Lets us notice changes in your income and spending over time, so we can tell you if something's shifting before it becomes a problem. Turning this off means we'll only look at your current snapshot, not how it's changing.",
  },
  {
    key: 'vernacular_assistance',
    title: 'Responses in your language',
    description:
      'Lets us explain things to you in Hindi or your preferred language instead of English only. Turning this off means explanations will only be available in English.',
  },
];

export function PrivacyPage() {
  const { customerId } = useDemoCustomer();
  const consentQuery = useConsent(customerId);
  const updateMutation = useUpdateConsent(customerId);
  const analyzeMutation = useAnalyzeMutation(customerId);
  const reducedMotion = usePrefersReducedMotion();
  const { showToast } = useToast();

  const [draft, setDraft] = useState<Consent | null>(null);
  const [demoRuns, setDemoRuns] = useState<DemoRun[]>([]);
  const nextRunId = useRef(0);

  useEffect(() => {
    if (consentQuery.data) setDraft(consentQuery.data);
  }, [consentQuery.data]);

  // Reset the demo's before/after history whenever the demo customer
  // changes, so a switch never shows a comparison that mixes two
  // different customers' decisions.
  const [trackedCustomerId, setTrackedCustomerId] = useState(customerId);
  if (customerId !== trackedCustomerId) {
    setTrackedCustomerId(customerId);
    setDemoRuns([]);
  }

  const isDirty = draft && consentQuery.data && JSON.stringify(draft) !== JSON.stringify(consentQuery.data);
  const hasUnsavedAnomalyChange = !!draft && !!consentQuery.data && draft.anomaly_analysis !== consentQuery.data.anomaly_analysis;

  const handleSave = () => {
    if (!draft) return;
    updateMutation.mutate(draft, {
      onSuccess: () => showToast('Your privacy settings were updated.', 'success'),
      onError: () => showToast('We could not save your privacy settings.', 'error'),
    });
  };

  const runDemoAnalysis = () => {
    analyzeMutation.mutate(
      {},
      {
        onSuccess: (data) => {
          nextRunId.current += 1;
          setDemoRuns((prev) => [...prev, { id: nextRunId.current, decision: data.decision }]);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-section">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
          <ShieldCheck size={22} className="text-primary" /> Privacy center
        </h1>
        <p className="mt-1 text-sm text-muted">You control what data is used to personalize your experience.</p>
      </div>

      <section className="flex flex-col gap-base">
        <Alert tone="neutral" title="Your permissions can be changed at any time.">
          Each setting below controls something specific and real — turning it off changes what analysis can
          actually run, it isn&apos;t cosmetic. Not every setting has an equally dramatic effect; we say exactly what
          each one does.
        </Alert>

        {consentQuery.isLoading ? (
          <LoadingState message="Loading your privacy settings…" />
        ) : consentQuery.isError ? (
          <ErrorState title="We couldn't load your privacy settings." error={consentQuery.error} onRetry={() => consentQuery.refetch()} />
        ) : draft ? (
          <>
            <div className="flex flex-col divide-y divide-hairline-soft rounded-lg border border-hairline bg-canvas">
              {FIELDS.map((field) => (
                <div key={field.key} className="flex flex-col gap-3 p-base">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-ink">{field.title}</p>
                      <p className="mt-0.5 text-sm text-muted">{field.description}</p>
                    </div>
                    <Switch
                      checked={draft[field.key]}
                      onCheckedChange={(checked) => setDraft({ ...draft, [field.key]: checked })}
                      label={field.title}
                    />
                  </div>
                  {field.key === 'vernacular_assistance' && (
                    <LanguageAvailabilityPreview enabled={draft.vernacular_assistance} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={!isDirty || updateMutation.isPending}>
                Save changes
              </Button>
              {!isDirty && !updateMutation.isPending && (
                <span className="text-xs text-muted">Your settings are up to date.</span>
              )}
            </div>

            <AnomalyDemoPanel
              savedAnomalyEnabled={consentQuery.data!.anomaly_analysis}
              hasUnsavedAnomalyChange={hasUnsavedAnomalyChange}
              runs={demoRuns}
              onRun={runDemoAnalysis}
              isPending={analyzeMutation.isPending}
              isError={analyzeMutation.isError}
              error={analyzeMutation.error}
              reducedMotion={reducedMotion}
            />
          </>
        ) : null}
      </section>

      <section className="flex flex-col gap-base">
        <SectionHeading
          title="What we've looked at"
          description="A record of every decision made for your account, most recent first."
        />
        <AuditHistoryList />
      </section>
    </div>
  );
}
