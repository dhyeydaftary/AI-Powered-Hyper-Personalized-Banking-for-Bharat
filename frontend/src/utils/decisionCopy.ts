import type { Decision, DecisionType, Transaction } from '@/types';
import { getReasonCodeCopy } from './reasonCodes';
import { formatCurrency, formatDateShort } from './format';
import { isLargestDebit } from './verifyTransaction';

export interface DecisionTone {
  label: string;
  headline: string;
  tone: 'positive' | 'attention' | 'critical' | 'neutral';
}

/**
 * Restrained, calm copy per decision state (Sections 21-25). This never
 * fabricates the reason — that comes from reason_codes via reasonCodes.ts —
 * it only sets the headline framing and visual tone for the state itself.
 *
 * Takes just the two fields it actually reads, not a full `Decision`, so it
 * also works directly on an `AuditEntry` (Privacy page's decision history),
 * which carries the same `decision`/`reason_codes` shape but not the rest
 * of `Decision`'s fields.
 */
export function getDecisionTone(decision: Pick<Decision, 'decision' | 'reason_codes'>): DecisionTone {
  const type: DecisionType = decision.decision;

  switch (type) {
    case 'RECOMMEND':
      return {
        label: 'Recommendation',
        headline: 'You may benefit from this',
        tone: 'positive',
      };
    case 'INTERVENE':
      return {
        label: 'Worth a look',
        headline: 'Something may need your attention',
        tone: 'attention',
      };
    case 'VERIFY':
      return {
        label: 'Verification needed',
        headline: 'We noticed something unusual',
        tone: 'critical',
      };
    case 'NO_ACTION': {
      const isThinFile = decision.reason_codes.includes('INSUFFICIENT_HISTORY');
      return isThinFile
        ? {
            label: 'Still learning',
            headline: 'Still learning your financial picture',
            tone: 'neutral',
          }
        : {
            label: 'All clear',
            headline: 'Everything looks stable',
            tone: 'neutral',
          };
    }
    default:
      return { label: 'Update', headline: 'Here is an update', tone: 'neutral' };
  }
}

/**
 * The backend's `action` field is currently always null in the deterministic
 * mock fallback, but the schema allows a structured object from a real
 * intelligence service. When present, surface its `label` if it has one;
 * otherwise fall back to a reasonable, tone-appropriate suggestion so the
 * customer is never shown nothing.
 */
export function getSuggestedAction(decision: Decision): string | null {
  const action = decision.action;
  if (action && typeof action === 'object' && 'label' in action && typeof action.label === 'string') {
    return action.label;
  }

  switch (decision.decision) {
    case 'RECOMMEND':
      return 'Review this opportunity';
    case 'INTERVENE':
      return 'Review discretionary spending';
    case 'VERIFY':
      return 'Verify this transaction';
    case 'NO_ACTION':
      return null;
    default:
      return null;
  }
}

/**
 * A plain-language sentence describing what actually happened, specific to
 * the real transaction where one can be identified — never a generic
 * bullet like "we noticed an unusual transaction" (Section 22 fix). Falls
 * back to an amount-only sentence when the specific transaction can't be
 * matched unambiguously, and to a fully generic sentence when even the
 * amount is missing — but never fabricates a merchant or date that isn't
 * in the data.
 */
export function getVerifyNarrative(decision: Decision, matchedTransaction: Transaction | null): string {
  if (matchedTransaction) {
    return `A payment of ${formatCurrency(matchedTransaction.amount)} to ${matchedTransaction.merchant} on ${formatDateShort(matchedTransaction.date)} stood out from your usual spending.`;
  }
  const amount =
    decision.signals && typeof decision.signals.unusual_amount === 'number' ? decision.signals.unusual_amount : null;
  if (amount !== null) {
    return `A transaction of ${formatCurrency(amount)} stood out from your usual spending.`;
  }
  return 'A transaction stood out from your usual spending pattern.';
}

/** A one-line, plain-language reason the flagged transaction matters,
 * grounded in a real comparison against the customer's own history rather
 * than an unqualified claim. */
export function getVerifyWhyItMatters(matchedTransaction: Transaction | null, transactions: Transaction[]): string {
  if (matchedTransaction) {
    return isLargestDebit(matchedTransaction, transactions)
      ? 'This is larger than any single transaction in your recent history.'
      : 'This is noticeably larger than your typical transaction size.';
  }
  return 'This amount is larger than what we typically see in your account.';
}

/** Short phrase (not a full sentence, to match the style of the other
 * signal interpretations in signals.ts) grounding the raw transaction
 * amount in a real comparison, for use directly under the number itself. */
export function getVerifyAmountInterpretation(matchedTransaction: Transaction | null, transactions: Transaction[]): string {
  if (matchedTransaction) {
    return isLargestDebit(matchedTransaction, transactions)
      ? 'the largest single transaction in your recent history'
      : 'larger than your typical transaction size';
  }
  return 'larger than typical for your account';
}

/**
 * For non-VERIFY decisions, reuse the first reason code's own "detail"
 * copy as the one-line "why it matters" — that copy already exists and is
 * already plain language, so this avoids inventing a second, possibly
 * inconsistent explanation of the same signal.
 */
export function getWhyItMattersForDecision(decision: Decision): string | null {
  const [firstCode] = decision.reason_codes;
  if (!firstCode) return null;
  const { detail } = getReasonCodeCopy(firstCode);
  return detail || null;
}

/**
 * A coarse ordering of decision states by how much attention they call for,
 * used only to decide whether a hypothetical scenario reads as worse than a
 * customer's current one (What-if page) — never shown to the customer or
 * used to fabricate a ranking the backend didn't imply. RECOMMEND and
 * NO_ACTION both mean "nothing to worry about" so they share the floor.
 */
const DECISION_SEVERITY: Record<DecisionType, number> = {
  RECOMMEND: 0,
  NO_ACTION: 0,
  INTERVENE: 1,
  VERIFY: 2,
};

/** True when `next` calls for more attention than `previous` — e.g. a
 * hypothetical loan that would push a customer from NO_ACTION to INTERVENE. */
export function isDecisionMoreSevere(previous: DecisionType, next: DecisionType): boolean {
  return DECISION_SEVERITY[next] > DECISION_SEVERITY[previous];
}

export function getDecisionSupportingCopy(decision: Decision): string {
  const type = decision.decision;
  const isThinFile = decision.reason_codes.includes('INSUFFICIENT_HISTORY');

  switch (type) {
    case 'RECOMMEND':
      return 'Based on your recent financial activity, we found an opportunity worth considering.';
    case 'INTERVENE':
      return 'A meaningful pattern in your finances may be worth reviewing.';
    case 'VERIFY':
      return 'Please take a moment to verify this before it is treated as normal activity.';
    case 'NO_ACTION':
      return isThinFile
        ? "We don't yet have enough history to offer a confident recommendation."
        : 'No action is needed right now.';
    default:
      return '';
  }
}
