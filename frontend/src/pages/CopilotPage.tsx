import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, ArrowRight } from 'lucide-react';
import { useDemoCustomer } from '@/state/demo-customer-context';
import { useTransactions } from '@/hooks/useTransactions';
import { useFinancialHealth } from '@/hooks/useFinancialHealth';
import { useLatestDecision } from '@/hooks/useDecision';
import { useLoans } from '@/hooks/useLoans';
import { DecisionCard } from '@/components/decision/DecisionCard';
import { CopilotFeedback } from '@/components/copilot/CopilotFeedback';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  getSuggestedIntentIds,
  getIntents,
  matchTypedQuestion,
  type CopilotAnswer,
  type CopilotContext,
} from '@/utils/copilotIntents';
import { cn } from '@/utils/cn';

interface ThreadEntry {
  id: number;
  questionText: string;
  intentId: string | null;
  answer: CopilotAnswer;
}

function ChipButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-pill border border-hairline bg-canvas px-base py-2 text-sm text-ink transition-all duration-100 ease-out hover:bg-surface-soft active:scale-[0.97]"
    >
      {label}
    </button>
  );
}

function AnswerBubble({
  entry,
  customerId,
  suggestedChips,
  onAsk,
}: {
  entry: ThreadEntry;
  customerId: string;
  suggestedChips: { id: string; chipLabel: string }[];
  onAsk: (intentId: string) => void;
}) {
  const followUps = entry.intentId ? getIntents(getFollowUpIds(entry.intentId)) : [];

  return (
    <div className="flex animate-slide-up flex-col gap-2 rounded-lg border border-hairline bg-canvas p-base">
      <p className="text-sm font-medium text-ink">{entry.questionText}</p>
      <p className="text-sm text-body">{entry.answer.text}</p>

      {!entry.intentId && (
        <div className="flex flex-wrap gap-2 pt-1">
          {suggestedChips.map((chip) => (
            <ChipButton key={chip.id} label={chip.chipLabel} onClick={() => onAsk(chip.id)} />
          ))}
        </div>
      )}

      {entry.answer.links.length > 0 && (
        <div className="flex flex-wrap gap-4 pt-1">
          {entry.answer.links.map((link) => (
            <Link key={link.to} to={link.to} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              {link.label} <ArrowRight size={14} />
            </Link>
          ))}
        </div>
      )}

      {followUps.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted">You might also ask:</span>
          {followUps.map((intent) => (
            <ChipButton key={intent.id} label={intent.chipLabel} onClick={() => onAsk(intent.id)} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-end border-t border-hairline-soft pt-2">
        <CopilotFeedback customerId={customerId} decisionId={entry.answer.decisionId} questionId={entry.intentId ?? 'unmatched'} />
      </div>
    </div>
  );
}

// A small fixed mapping from question-type to likely-next-question-type —
// still intent-matched, never freeform — so a thread feels like a real
// back-and-forth instead of a string of unrelated one-shot lookups.
const FOLLOW_UP_MAP: Record<string, string[]> = {
  verify_why: ['verify_next'],
  savings_declining_why: ['savings_what_to_do'],
  recommend_why: ['recommend_good_idea'],
};

function getFollowUpIds(intentId: string): string[] {
  return FOLLOW_UP_MAP[intentId] ?? [];
}

export function CopilotPage() {
  const { customerId } = useDemoCustomer();
  const transactionsQuery = useTransactions(customerId, 1, 100);
  const healthQuery = useFinancialHealth(customerId);
  const decisionQuery = useLatestDecision(customerId);
  const loansQuery = useLoans(customerId);

  const [input, setInput] = useState('');
  const [thread, setThread] = useState<ThreadEntry[]>([]);
  const nextId = useRef(1);

  const isLoading = transactionsQuery.isLoading || healthQuery.isLoading || decisionQuery.isLoading || loansQuery.isLoading;
  const isError = transactionsQuery.isError || healthQuery.isError || decisionQuery.isError || loansQuery.isError;
  const firstError = transactionsQuery.error ?? healthQuery.error ?? decisionQuery.error ?? loansQuery.error;

  const context: CopilotContext = useMemo(
    () => ({
      transactions: transactionsQuery.data?.items ?? [],
      health: healthQuery.data,
      decision: decisionQuery.data,
      loans: loansQuery.data ?? [],
    }),
    [transactionsQuery.data, healthQuery.data, decisionQuery.data, loansQuery.data]
  );

  const suggestedIds = getSuggestedIntentIds(context.decision?.decision);
  const suggestedIntents = getIntents(suggestedIds);
  const suggestedChips = suggestedIntents.map((i) => ({ id: i.id, chipLabel: i.chipLabel }));

  const refetchAll = () => {
    transactionsQuery.refetch();
    healthQuery.refetch();
    decisionQuery.refetch();
    loansQuery.refetch();
  };

  const askIntent = (intentId: string) => {
    const intent = getIntents([intentId])[0];
    if (!intent) return;
    const answer = intent.buildAnswer(context);
    setThread((prev) => [...prev, { id: nextId.current++, questionText: intent.chipLabel, intentId: intent.id, answer }]);
  };

  const askTyped = (text: string) => {
    const intent = matchTypedQuestion(text);
    if (intent) {
      const answer = intent.buildAnswer(context);
      setThread((prev) => [...prev, { id: nextId.current++, questionText: text, intentId: intent.id, answer }]);
    } else {
      setThread((prev) => [
        ...prev,
        {
          id: nextId.current++,
          questionText: text,
          intentId: null,
          answer: { text: "I can't answer that one yet — here's what I can help with:", links: [] },
        },
      ]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    askTyped(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
          <Sparkles size={22} className="text-primary" /> Copilot
        </h1>
        <p className="mt-1 text-sm text-muted">Straight answers about your own accounts, grounded in your real data.</p>
      </div>

      {isError ? (
        <ErrorState title="We couldn't load your financial picture." error={firstError} onRetry={refetchAll} />
      ) : (
        <>
          <section>
            <h2 className="mb-base text-sm font-semibold text-ink">Your situation right now</h2>
            {isLoading ? (
              <LoadingState message="Loading your financial picture…" />
            ) : context.decision ? (
              <DecisionCard
                customerId={customerId}
                decision={context.decision}
                historyMonths={context.health?.history_months ?? 0}
                transactions={context.transactions}
              />
            ) : (
              <EmptyState title="Still getting to know you" description="Once we have more activity, an insight will appear here." />
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-ink">Ask something</h2>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                aria-label="Ask a question about your money"
                disabled={isLoading}
              />
              <Button type="submit" size="md" aria-label="Send" disabled={isLoading}>
                <Send size={16} />
              </Button>
            </form>
            <p className="text-xs text-muted">
              I can answer questions about your accounts using your data. I can&apos;t move money, approve loans, or take
              actions for you.
            </p>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Suggested for you right now</p>
              <div className={cn('flex flex-wrap gap-2', isLoading && 'pointer-events-none opacity-50')}>
                {suggestedChips.map((chip) => (
                  <ChipButton key={chip.id} label={chip.chipLabel} onClick={() => askIntent(chip.id)} />
                ))}
              </div>
            </div>

            {thread.length > 0 && (
              <div className="flex flex-col gap-2 pt-2">
                {thread.map((entry) => (
                  <AnswerBubble key={entry.id} entry={entry} customerId={customerId} suggestedChips={suggestedChips} onAsk={askIntent} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
