/**
 * Formatting utilities for Indian currency, percentages, dates, and reason code descriptions.
 */

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  const pct = value <= 1 ? value * 100 : value;
  return `${pct.toFixed(1)}%`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export function formatConfidence(score: number): {
  label: string;
  level: 'high' | 'medium' | 'low';
  percent: string;
  badgeClass: string;
} {
  const percent = `${Math.round(score * 100)}%`;
  if (score >= 0.85) {
    return { label: 'High', level: 'high', percent, badgeClass: 'confidence-fill high' };
  } else if (score >= 0.7) {
    return { label: 'Medium', level: 'medium', percent, badgeClass: 'confidence-fill medium' };
  } else {
    return { label: 'Low (Human Review Required)', level: 'low', percent, badgeClass: 'confidence-fill low' };
  }
}

export const REASON_CODE_DESCRIPTIONS: Record<string, string> = {
  HIGH_EMI_BURDEN: 'High EMI-to-income ratio (EMI obligations exceed 35% of monthly income)',
  DECLINING_SAVINGS: 'Sustained decline in savings rate over consecutive monthly periods',
  RISING_EXPENSE_RATIO: 'Expense-to-income ratio rising steadily month-over-month',
  INCOME_INSTABILITY: 'High variance in incoming salary or credits',
  UNUSUAL_TRANSACTION: 'Single transaction magnitude significantly exceeds historical baseline (>80% monthly income)',
  ANOMALY_DETECTED: 'Statistical anomaly detected in payment category or frequency',
  INSUFFICIENT_HISTORY: 'Limited transaction history (≤ 1 month available, cold start)',
  LOW_DATA_CONFIDENCE: 'Restricted consent scope or missing data fields reduced overall confidence',
  HEALTHY_FINANCIAL_TREND: 'Consistent income, low EMI burden, and disciplined mutual fund / savings allocations',
  STABLE_INCOME: 'Regular monthly salary credits with predictable income stability',
  NO_REASONABLE_BENEFIT: 'Financial profile shows no actionable stress or clear product benefit requirement',
};

export function translateReasonCode(code: string): string {
  return REASON_CODE_DESCRIPTIONS[code] || code.replace(/_/g, ' ');
}
