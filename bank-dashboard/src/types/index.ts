export type DecisionType = 'RECOMMEND' | 'INTERVENE' | 'VERIFY' | 'NO_ACTION';

export interface Consent {
  behavioral_trend_analysis: boolean;
  anomaly_analysis: boolean;
  vernacular_assistance: boolean;
}

export interface Customer {
  customer_id: string;
  name: string;
  age: number;
  preferred_language: string;
  monthly_income: number;
  consent: Consent;
  created_at?: string;
  updated_at?: string;
}

export type TransactionType = 'CREDIT' | 'DEBIT';
export type TransactionCategory =
  | 'SALARY'
  | 'EMI'
  | 'GROCERIES'
  | 'RENT'
  | 'UTILITIES'
  | 'SHOPPING'
  | 'TRAVEL'
  | 'HEALTH'
  | 'TRANSFER'
  | 'OTHER';

export interface Transaction {
  transaction_id: string;
  customer_id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  merchant: string;
}

export interface Loan {
  loan_id: string;
  customer_id: string;
  principal: number;
  outstanding: number;
  monthly_emi: number;
  annual_interest_rate: number;
  remaining_months: number;
}

export interface FinancialHealth {
  customer_id: string;
  emi_to_income_ratio: number;
  savings_rate: number;
  expense_to_income_ratio: number;
  balance_trend: string;
  income_stability: number;
  history_months: number;
  confidence: number;
}

export interface DecisionAction {
  title?: string;
  type?: string;
  description?: string;
  suggested_product?: string;
  amount?: number;
  support_type?: string;
}

export interface DecisionSignals {
  emi_to_income_ratio?: number;
  savings_rate?: number;
  expense_to_income_ratio?: number;
  history_months?: number;
  anomaly_score?: number;
  unusual_transaction_id?: string;
  unusual_amount?: number;
  [key: string]: unknown;
}

export interface Decision {
  decision_id: string;
  customer_id: string;
  decision: DecisionType;
  confidence: number;
  reason_codes: string[];
  action?: DecisionAction | null;
  signals?: DecisionSignals | null;
  policy_version: string;
  timestamp: string;
}

export interface AuditEntry {
  id?: string;
  decision_id: string;
  customer_id: string;
  decision: DecisionType;
  reason_codes: string[];
  confidence: number;
  policy_version: string;
  audit_timestamp: string;
  notes?: string;
  reviewed_by?: string;
}

export type FeedbackEventType = 'HELPFUL' | 'NOT_HELPFUL' | 'DISMISSED' | 'ENGAGED' | 'FOLLOW_UP';

export interface Feedback {
  id: string;
  customer_id: string;
  event_type: FeedbackEventType;
  decision_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface SystemAnalytics {
  total_customers: number;
  decision_counts: Record<DecisionType, number>;
  confidence_buckets: {
    high: number;    // >= 0.85
    medium: number;  // 0.70 - 0.84
    low: number;     // < 0.70
  };
  reason_code_counts: Record<string, number>;
  no_action_percentage: number;
  review_queue_count: number;
}
