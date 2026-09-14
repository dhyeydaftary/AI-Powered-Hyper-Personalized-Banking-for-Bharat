import type { Decision, DecisionType, FinancialHealth, Loan, Transaction } from '@/types';
import {
  computeMonthlyTotals,
  computeMonthlySavingsRate,
  computeDiscretionarySpendingTotals,
  describeTrendDirection,
} from './analytics';
import { computeRepaymentRatio } from './loanMath';
import { getConfidenceLevel } from './confidence';
import {
  getDecisionSupportingCopy,
  getSuggestedAction,
  getVerifyNarrative,
  getVerifyWhyItMatters,
  getWhyItMattersForDecision,
} from './decisionCopy';
import { findMatchedTransaction } from './verifyTransaction';
import { getReasonCodeCopy } from './reasonCodes';
import { interpretEmiToIncome, interpretSavingsRate } from './financialHealthCopy';
import { formatCurrency, formatPercent, formatCategory } from './format';

/**
 * There is no chat endpoint and no natural-language summary field on
 * `decision` or `financial-health` — every sentence here is built from
 * real structured fields (reason_codes, confidence, signals, the numeric
 * ratios, transactions, loans) using the same plain-language mapping
 * already established elsewhere in the app. Nothing here is generated;
 * an intent that doesn't apply to the customer's current state says so
 * honestly instead of guessing.
 */

export interface CopilotContext {
  transactions: Transaction[];
  health: FinancialHealth | undefined;
  decision: Decision | null | undefined;
  loans: Loan[];
}

export interface CopilotLink {
  label: string;
  to: string;
}

export interface CopilotAnswer {
  text: string;
  links: CopilotLink[];
  /** Only set when the answer is really about a specific decision —
   * lets the feedback control ground its POST /feedback call in the real
   * decision_id instead of a made-up one. */
  decisionId?: string;
}

export interface CopilotIntent {
  id: string;
  chipLabel: string;
  keywords: string[];
  buildAnswer: (ctx: CopilotContext) => CopilotAnswer;
  followUps?: string[];
}

function isThinHistory(health: FinancialHealth | undefined): boolean {
  return !!health && getConfidenceLevel(health.confidence) === 'low';
}

/** Prefixes a sentence with a visible hedge when the underlying data is
 * thin, instead of stating it with the same flat certainty used for a
 * well-established customer — a different template branch keyed off the
 * same confidence/history_months fields already read elsewhere. */
function frame(health: FinancialHealth | undefined, sentence: string): string {
  if (!isThinHistory(health)) return sentence;
  const months = health!.history_months;
  const monthsText = months === 1 ? '1 month' : `${months} months`;
  return `Based on the little history I have so far (just ${monthsText}), it looks like ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

const intents: CopilotIntent[] = [
  {
    id: 'verify_why',
    chipLabel: 'Why was this transaction flagged?',
    keywords: ['flagged', 'flag', 'unusual transaction', 'why was this transaction', 'suspicious'],
    buildAnswer: (ctx) => {
      if (ctx.decision?.decision !== 'VERIFY') {
        return { text: "You don't have anything flagged for verification right now — I'll surface this here if that changes.", links: [] };
      }
      const matched = findMatchedTransaction(ctx.decision, ctx.transactions);
      const narrative = getVerifyNarrative(ctx.decision, matched);
      const why = getVerifyWhyItMatters(matched, ctx.transactions);
      return {
        text: `${narrative} ${why}`,
        links: [{ label: 'See it in your activity', to: '/transactions' }],
        decisionId: ctx.decision.decision_id,
      };
    },
    followUps: ['verify_next'],
  },
  {
    id: 'verify_next',
    chipLabel: "What happens if I don't recognize it?",
    keywords: ["don't recognize", 'dont recognize', 'not me', 'fraud', 'what happens if'],
    buildAnswer: (ctx) => {
      if (ctx.decision?.decision !== 'VERIFY') {
        return { text: "There's nothing awaiting verification right now, so there's nothing to confirm or flag.", links: [] };
      }
      return {
        text:
          'If this was you, choose "This was me" on the insight card and nothing further happens. If you don\'t recognize it, choose "I don\'t recognize this" — that flags it for follow-up. I can\'t make that choice for you.',
        links: [{ label: 'Go to Overview', to: '/overview' }],
        decisionId: ctx.decision.decision_id,
      };
    },
  },
  {
    id: 'savings_declining_why',
    chipLabel: 'Why is my savings going down?',
    keywords: ['savings going down', 'savings declin', 'savings drop', 'why is my saving', 'saving less'],
    buildAnswer: (ctx) => {
      const monthly = computeMonthlyTotals(ctx.transactions);
      const series = computeMonthlySavingsRate(monthly).filter(
        (p): p is { month: string; label: string; value: number } => p.value !== null
      );
      const trend = describeTrendDirection(series);
      const reasonDetail = ctx.decision ? getWhyItMattersForDecision(ctx.decision) : null;

      let text: string;
      if (series.length >= 2 && trend.direction === 'down') {
        text = `Your savings rate has been declining since ${trend.sinceLabel}.`;
      } else if (ctx.health && ctx.health.savings_rate !== null) {
        text = `Your current savings rate is ${formatPercent(ctx.health.savings_rate)}, and it hasn't shown a clear decline in the months I can see.`;
      } else {
        text = "I don't have enough history yet to tell whether your savings rate is declining.";
      }
      if (reasonDetail) text += ` ${reasonDetail}`;

      return {
        text: frame(ctx.health, text),
        links: [{ label: 'See the trend on Money', to: '/money' }],
        decisionId: ctx.decision?.decision_id,
      };
    },
    followUps: ['savings_what_to_do'],
  },
  {
    id: 'savings_what_to_do',
    chipLabel: 'What can I do about it?',
    keywords: ['what can i do', 'how do i fix', 'improve my saving', 'improve my spending'],
    buildAnswer: (ctx) => {
      const suggested = ctx.decision ? getSuggestedAction(ctx.decision) : null;
      const text = suggested
        ? `${suggested}. Seeing exactly where your money is going each month is a good place to start.`
        : "I can't tell you what to cut, but I can show you exactly where your money is going each month so you can decide.";
      return {
        text,
        links: [{ label: 'See spending by category', to: '/money' }],
        decisionId: ctx.decision?.decision_id,
      };
    },
  },
  {
    id: 'recommend_why',
    chipLabel: 'Why am I seeing this recommendation?',
    keywords: ['why am i seeing', 'why this recommendation', 'why recommend'],
    buildAnswer: (ctx) => {
      if (ctx.decision?.decision !== 'RECOMMEND') {
        return { text: "There's no recommendation active for you right now.", links: [] };
      }
      const supporting = getDecisionSupportingCopy(ctx.decision);
      const topReason = ctx.decision.reason_codes[0] ? getReasonCodeCopy(ctx.decision.reason_codes[0]) : null;
      const text = [supporting, topReason?.detail].filter(Boolean).join(' ');
      return {
        text,
        links: [{ label: 'See the full insight on Overview', to: '/overview' }],
        decisionId: ctx.decision.decision_id,
      };
    },
    followUps: ['recommend_good_idea'],
  },
  {
    id: 'recommend_good_idea',
    chipLabel: 'Is this a good idea for me right now?',
    keywords: ['good idea', 'should i take', 'should i do this', 'right for me', 'is this worth it'],
    buildAnswer: (ctx) => ({
      text:
        "That's not something I can decide for you. What I can do is show you exactly how your numbers would change if you went ahead — try it before deciding anything.",
      links: [{ label: 'Model it in What-if', to: '/what-if' }],
      decisionId: ctx.decision?.decision_id,
    }),
  },
  {
    id: 'spending_trend',
    chipLabel: 'How is my spending trending?',
    keywords: ['spending trend', 'how is my spending', 'spending going', 'spending pattern'],
    buildAnswer: (ctx) => {
      const monthly = computeMonthlyTotals(ctx.transactions);
      if (monthly.length < 2) {
        return {
          text: frame(ctx.health, "There's only one month of activity on record, so I can't show a trend yet."),
          links: [{ label: 'See your activity', to: '/money' }],
        };
      }
      const gapSeries = monthly.map((m) => ({ label: m.label, value: m.net }));
      const trend = describeTrendDirection(gapSeries);
      const latest = monthly[monthly.length - 1];
      let text: string;
      if (trend.direction === 'down') {
        text = `The gap between what comes in and what goes out has been narrowing since ${trend.sinceLabel} — your most recent month's expenses were ${formatCurrency(latest.expense)}.`;
      } else if (trend.direction === 'up') {
        text = `The gap between what comes in and what goes out has been widening since ${trend.sinceLabel} — your most recent month's expenses were ${formatCurrency(latest.expense)}.`;
      } else {
        text = `Your income and expenses have stayed fairly steady — your most recent month's expenses were ${formatCurrency(latest.expense)}.`;
      }
      return { text: frame(ctx.health, text), links: [{ label: 'See the full trend on Money', to: '/money' }] };
    },
  },
  {
    id: 'savings_rate',
    chipLabel: "What's my savings rate?",
    keywords: ['savings rate', 'how much am i saving', "what's my saving"],
    buildAnswer: (ctx) => {
      if (!ctx.health || ctx.health.savings_rate === null) {
        return { text: "I don't have enough history yet to calculate your savings rate.", links: [{ label: 'See Money', to: '/money' }] };
      }
      const interp = interpretSavingsRate(ctx.health.savings_rate);
      const text = `Your savings rate is ${formatPercent(ctx.health.savings_rate)} — ${lowerFirst(interp.text)}`;
      return { text: frame(ctx.health, text), links: [{ label: 'See the full breakdown on Money', to: '/money' }] };
    },
  },
  {
    id: 'emi_burden',
    chipLabel: "What's my EMI burden?",
    keywords: ['emi burden', 'emi', 'loan repayment burden', 'how much of my income'],
    buildAnswer: (ctx) => {
      if (!ctx.health || ctx.health.emi_to_income_ratio === null) {
        return { text: "I don't have enough history yet to calculate your EMI burden.", links: [{ label: 'See Money', to: '/money' }] };
      }
      const interp = interpretEmiToIncome(ctx.health.emi_to_income_ratio);
      const text = `Your EMI payments take up ${formatPercent(ctx.health.emi_to_income_ratio)} of your income — ${lowerFirst(interp.text)}`;
      return { text: frame(ctx.health, text), links: [{ label: 'See the full breakdown on Money', to: '/money' }] };
    },
  },
  {
    id: 'spending_this_month',
    chipLabel: 'Where did my money go this month?',
    keywords: ['where did my money go', 'spent this month', 'spending this month', 'biggest category'],
    buildAnswer: (ctx) => {
      const totals = computeDiscretionarySpendingTotals(ctx.transactions);
      if (totals.length === 0) {
        return { text: "There's no discretionary spending on record yet.", links: [{ label: 'See your activity', to: '/transactions' }] };
      }
      const top = totals[0];
      const text =
        totals.length === 1
          ? `The only discretionary spending category on record so far is ${formatCategory(top.category)}, at ${formatCurrency(top.total)}.`
          : `${formatCategory(top.category)} is your biggest spending category, at ${formatCurrency(top.total)}.`;
      return { text, links: [{ label: 'See the full breakdown on Money', to: '/money' }] };
    },
  },
  {
    id: 'loan_status',
    chipLabel: "What's my loan status?",
    keywords: ['loan status', 'my loan', 'outstanding loan', 'how much do i owe', 'loan balance'],
    buildAnswer: (ctx) => {
      if (ctx.loans.length === 0) {
        return { text: "You don't currently have any active loans.", links: [{ label: 'See Loans', to: '/loans' }] };
      }
      const loan = ctx.loans[0];
      const ratio = computeRepaymentRatio(loan);
      const text = `You have ${formatCurrency(loan.outstanding)} outstanding, ${formatPercent(ratio)} repaid so far. Your EMI is ${formatCurrency(
        loan.monthly_emi
      )}/month for ${loan.remaining_months} more months.`;
      return { text, links: [{ label: 'See full loan details', to: '/loans' }] };
    },
  },
];

const intentById = new Map(intents.map((intent) => [intent.id, intent]));

export function getIntent(id: string): CopilotIntent | undefined {
  return intentById.get(id);
}

export function getIntents(ids: string[]): CopilotIntent[] {
  return ids.map((id) => intentById.get(id)).filter((i): i is CopilotIntent => !!i);
}

/**
 * The suggested chips lead with questions relevant to the customer's
 * actual current decision state, not a fixed list — the real difference
 * between a copilot that feels aware of the situation and a generic FAQ.
 */
export function getSuggestedIntentIds(decisionType: DecisionType | null | undefined): string[] {
  let leading: string[];
  switch (decisionType) {
    case 'VERIFY':
      leading = ['verify_why', 'verify_next'];
      break;
    case 'INTERVENE':
      leading = ['savings_declining_why', 'savings_what_to_do'];
      break;
    case 'RECOMMEND':
      leading = ['recommend_why', 'recommend_good_idea'];
      break;
    default:
      leading = ['spending_trend', 'savings_rate'];
  }
  const evergreen = ['emi_burden', 'spending_this_month'];
  return [...leading, ...evergreen];
}

/** Simple client-side keyword matching against the same known,
 * answerable question types behind the suggested chips — never a
 * general-purpose chat response. Order matters: more specific phrases
 * are checked before generic ones so "why is my savings rate going
 * down" resolves to the decline question, not the plain rate lookup. */
const MATCH_ORDER = [
  'verify_why',
  'verify_next',
  'savings_declining_why',
  'savings_what_to_do',
  'recommend_why',
  'recommend_good_idea',
  'loan_status',
  'emi_burden',
  'spending_this_month',
  'spending_trend',
  'savings_rate',
];

export function matchTypedQuestion(input: string): CopilotIntent | null {
  const term = input.toLowerCase();
  for (const id of MATCH_ORDER) {
    const intent = intentById.get(id)!;
    if (intent.keywords.some((kw) => term.includes(kw))) return intent;
  }
  return null;
}
