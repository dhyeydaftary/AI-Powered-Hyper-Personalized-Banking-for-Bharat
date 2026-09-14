/**
 * Confidence display convention (Section 28 of the frontend spec).
 *
 * The backend's `confidence` (0..1) is a model calibration signal, not a
 * probability the customer should read literally. These thresholds are a
 * prototype display convention only — never claim statistical calibration.
 */

export type ConfidenceLevel = 'low' | 'moderate' | 'high';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence < 0.5) return 'low';
  if (confidence < 0.75) return 'moderate';
  return 'high';
}

export function getConfidenceLabel(confidence: number): string {
  const level = getConfidenceLevel(confidence);
  return { low: 'Low', moderate: 'Moderate', high: 'High' }[level];
}

export function getConfidenceDescription(confidence: number, historyMonths: number): string {
  const level = getConfidenceLevel(confidence);
  const monthsText = historyMonths === 1 ? '1 month' : `${historyMonths} months`;

  if (level === 'low') {
    return historyMonths <= 1
      ? 'Based on very limited history. We are still learning your financial picture.'
      : `Based on ${monthsText} of activity. More history will improve accuracy.`;
  }
  if (level === 'moderate') {
    return `Based on ${monthsText} of financial activity.`;
  }
  return `Based on ${monthsText} of financial activity.`;
}
