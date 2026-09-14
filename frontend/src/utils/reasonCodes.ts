/**
 * Centralized mapping from backend reason codes to plain-language sentences.
 *
 * The backend returns raw reason codes such as HIGH_EMI_BURDEN or
 * INSUFFICIENT_HISTORY on the decision object. Never expose these raw
 * strings, and never expose technical language (feature_vector,
 * anomaly_probability, latent_embedding) — translate through this map only.
 * Add new codes here as the backend introduces them, rather than
 * translating ad hoc in individual components.
 */

interface ReasonCodeCopy {
  headline: string;
  detail: string;
}

const REASON_CODE_COPY: Record<string, ReasonCodeCopy> = {
  HIGH_EMI_BURDEN: {
    headline: 'Your loan repayments are a large share of your income',
    detail: 'Your monthly EMI obligations are taking up more of your income than is typically comfortable.',
  },
  DECLINING_SAVINGS: {
    headline: 'Your savings rate has been declining',
    detail: 'You have been keeping aside a smaller share of your income than in recent months.',
  },
  RISING_EXPENSE_RATIO: {
    headline: 'Your spending has been rising relative to your income',
    detail: 'A growing share of your income is going toward expenses.',
  },
  UNUSUAL_TRANSACTION: {
    headline: 'We noticed an unusual transaction',
    detail: 'A transaction stood out from your typical spending pattern and may be worth a second look.',
  },
  INSUFFICIENT_HISTORY: {
    headline: 'We are still learning your financial picture',
    detail: 'There is not yet enough transaction history to offer a confident, personalized view.',
  },
  LOW_DATA_CONFIDENCE: {
    headline: 'This analysis is based on limited data',
    detail: 'With more history, we will be able to give you a more precise picture.',
  },
  HEALTHY_FINANCIAL_TREND: {
    headline: 'Your finances are on a healthy trend',
    detail: 'Your income, spending, and savings are moving in a positive direction.',
  },
  STABLE_INCOME: {
    headline: 'Your income has been stable',
    detail: 'Regular income makes it easier to plan ahead with confidence.',
  },
};

function fallbackCopy(code: string): ReasonCodeCopy {
  const headline = code
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return { headline, detail: '' };
}

export function getReasonCodeCopy(code: string): ReasonCodeCopy {
  return REASON_CODE_COPY[code] ?? fallbackCopy(code);
}

export function getReasonHeadlines(codes: string[]): string[] {
  return codes.map((code) => getReasonCodeCopy(code).headline);
}
