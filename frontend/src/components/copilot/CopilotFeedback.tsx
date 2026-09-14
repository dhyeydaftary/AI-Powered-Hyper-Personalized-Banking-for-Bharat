import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useFeedbackMutation } from '@/hooks/useFeedback';
import { useToast } from '@/state/toast-context';
import { cn } from '@/utils/cn';

interface CopilotFeedbackProps {
  customerId: string;
  /** Only present when the answer is really about a specific decision —
   * omitted for answers about loans, spending, etc. `POST /feedback`
   * already accepts an optional decision_id, so this is a real, honest
   * use of the same endpoint the Overview insight card uses, not a new
   * invented field. */
  decisionId?: string;
  questionId: string;
}

/**
 * "Was this useful?" on every copilot answer, reusing the same
 * POST /feedback integration built for the Overview insight card
 * (Section 37) — every copilot interaction contributes to the same real
 * event log instead of being a dead end.
 */
export function CopilotFeedback({ customerId, decisionId, questionId }: CopilotFeedbackProps) {
  const { showToast } = useToast();
  const mutation = useFeedbackMutation(customerId);
  const [chosen, setChosen] = useState<'ENGAGED' | 'DISMISSED' | null>(null);

  const send = (eventType: 'ENGAGED' | 'DISMISSED') => {
    setChosen(eventType);
    mutation.mutate(
      { event_type: eventType, decision_id: decisionId, metadata: { source: 'copilot', question_id: questionId } },
      {
        onSuccess: () => showToast('Thanks — your feedback was recorded.', 'success'),
        onError: () => {
          showToast('Your feedback could not be sent. Please try again.', 'error');
          setChosen(null);
        },
      }
    );
  };

  if (chosen && mutation.isSuccess) {
    return <p className="text-xs text-muted">Thanks for the feedback.</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted">Was this useful?</span>
      <button
        type="button"
        onClick={() => send('ENGAGED')}
        disabled={mutation.isPending}
        aria-label="Yes, this was useful"
        aria-pressed={chosen === 'ENGAGED'}
        className={cn('rounded-sm p-1 text-muted hover:bg-surface-soft hover:text-up', chosen === 'ENGAGED' && 'text-up')}
      >
        <ThumbsUp size={13} />
      </button>
      <button
        type="button"
        onClick={() => send('DISMISSED')}
        disabled={mutation.isPending}
        aria-label="No, this was not useful"
        aria-pressed={chosen === 'DISMISSED'}
        className={cn('rounded-sm p-1 text-muted hover:bg-surface-soft hover:text-down', chosen === 'DISMISSED' && 'text-down')}
      >
        <ThumbsDown size={13} />
      </button>
    </div>
  );
}
