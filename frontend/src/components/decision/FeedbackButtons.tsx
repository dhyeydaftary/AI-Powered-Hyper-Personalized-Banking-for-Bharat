import { useState } from 'react';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useFeedbackMutation } from '@/hooks/useFeedback';
import { useTranslation } from '@/i18n';
import { useToast } from '@/state/toast-context';
import type { FeedbackEventType } from '@/types';
import { cn } from '@/utils/cn';

interface FeedbackButtonsProps {
  customerId: string;
  decisionId: string;
  className?: string;
}

/**
 * Records real feedback events (Section 37). "Helpful" maps to ENGAGED,
 * "Not helpful" and "Dismiss" both map to DISMISSED — these are the only
 * event_type values the backend accepts, so no other strings are invented.
 * This never claims to retrain anything; it only confirms the event was
 * recorded.
 */
export function FeedbackButtons({ customerId, decisionId, className }: FeedbackButtonsProps) {
  const t = useTranslation();
  const { showToast } = useToast();
  const mutation = useFeedbackMutation(customerId);
  const [chosen, setChosen] = useState<FeedbackEventType | null>(null);

  const send = (eventType: FeedbackEventType) => {
    setChosen(eventType);
    mutation.mutate(
      { event_type: eventType, decision_id: decisionId },
      {
        onSuccess: () => showToast(t.decision.feedbackRecorded, 'success'),
        onError: () => {
          showToast('Your feedback could not be sent. Please try again.', 'error');
          setChosen(null);
        },
      }
    );
  };

  if (chosen && mutation.isSuccess) {
    return <p className={cn('text-sm text-muted', className)}>{t.decision.feedbackRecorded}</p>;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => send('ENGAGED')}
        disabled={mutation.isPending}
        aria-pressed={chosen === 'ENGAGED'}
      >
        <ThumbsUp size={14} /> {t.decision.helpful}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => send('DISMISSED')}
        disabled={mutation.isPending}
        aria-pressed={chosen === 'DISMISSED'}
      >
        <ThumbsDown size={14} /> {t.decision.notHelpful}
      </Button>
      <button
        type="button"
        onClick={() => send('DISMISSED')}
        disabled={mutation.isPending}
        className="ml-1 rounded-sm p-1.5 text-muted hover:bg-surface-soft hover:text-ink"
        aria-label={t.decision.dismiss}
      >
        <X size={14} />
      </button>
    </div>
  );
}
