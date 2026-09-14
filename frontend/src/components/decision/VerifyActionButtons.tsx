import { useState } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useFeedbackMutation } from '@/hooks/useFeedback';
import { useTranslation } from '@/i18n';
import { useToast } from '@/state/toast-context';
import type { FeedbackEventType } from '@/types';
import { cn } from '@/utils/cn';

interface VerifyActionButtonsProps {
  customerId: string;
  decisionId: string;
  className?: string;
}

type VerifyResponse = 'confirmed' | 'unrecognized';

/**
 * Concrete next-step actions for a VERIFY decision (Section 22/26 fix) —
 * "This was me" and "I don't recognize this" — instead of a vague
 * suggestion to go check the transaction elsewhere. Both are real POST
 * /feedback calls. The backend only accepts ENGAGED/IGNORED/FOLLOW_UP/
 * DISMISSED as event_type, so no new event type is invented: "This was
 * me" resolves the verification with nothing further needed (DISMISSED),
 * and "I don't recognize this" asks for the bank to follow up
 * (FOLLOW_UP). Which response was actually given is preserved in
 * metadata rather than lost.
 */
const RESPONSE_EVENT: Record<VerifyResponse, FeedbackEventType> = {
  confirmed: 'DISMISSED',
  unrecognized: 'FOLLOW_UP',
};

export function VerifyActionButtons({ customerId, decisionId, className }: VerifyActionButtonsProps) {
  const t = useTranslation();
  const { showToast } = useToast();
  const mutation = useFeedbackMutation(customerId);
  const [chosen, setChosen] = useState<VerifyResponse | null>(null);

  const confirmationMessage = (response: VerifyResponse) =>
    response === 'confirmed' ? t.decision.verifyConfirmedRecorded : t.decision.verifyFlaggedRecorded;

  const send = (response: VerifyResponse) => {
    setChosen(response);
    mutation.mutate(
      { event_type: RESPONSE_EVENT[response], decision_id: decisionId, metadata: { verify_response: response } },
      {
        onSuccess: () => showToast(confirmationMessage(response), 'success'),
        onError: () => {
          showToast(t.decision.verifyResponseError, 'error');
          setChosen(null);
        },
      }
    );
  };

  if (chosen && mutation.isSuccess) {
    return <p className={cn('text-sm text-muted', className)}>{confirmationMessage(chosen)}</p>;
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Button variant="primary" size="sm" onClick={() => send('confirmed')} disabled={mutation.isPending}>
        <Check size={14} /> {t.decision.wasMe}
      </Button>
      <Button variant="outline" size="sm" onClick={() => send('unrecognized')} disabled={mutation.isPending}>
        <AlertTriangle size={14} /> {t.decision.dontRecognize}
      </Button>
    </div>
  );
}
