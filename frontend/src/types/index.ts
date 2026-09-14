/**
 * Domain types.
 *
 * These mirror the verified backend contract exactly — see
 * shared/schemas/decision.schema.json, shared/schemas/financial-context.schema.json,
 * backend/src/validators/index.ts and backend/prisma/schema.prisma (read directly,
 * since docs/API_CONTRACT.md is not fully in sync with the implementation).
 *
 * Do not add fields the backend does not return. Do not use `any`.
 */

// ---------- Standard API envelope ----------

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  error: null;
}

export interface ApiFailure {
  success: false;
  data: null;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: Pagination;
  error: null;
}

// ---------- Customer ----------

export interface Consent {
  behavioral_trend_analysis: boolean;
  anomaly_analysis: boolean;
  vernacular_assistance: boolean;
}

export type PreferredLanguage = 'en' | 'hi';

export interface Customer {
  customer_id: string;
  name: string;
  age: number;
  preferred_language: PreferredLanguage;
  monthly_income: number;
  consent: Consent | null;
  created_at: string;
  updated_at: string;
}

// ---------- Transactions ----------

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
  date: string; // ISO YYYY-MM-DD
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  merchant: string;
  created_at: string;
}

// ---------- Loans ----------

export interface Loan {
  loan_id: string;
  customer_id: string;
  principal: number;
  outstanding: number;
  monthly_emi: number;
  annual_interest_rate: number;
  remaining_months: number;
  created_at: string;
  updated_at: string;
}

// ---------- Financial health ----------

export type BalanceTrend = 'STABLE' | 'DECLINING' | 'IMPROVING' | string;

export interface FinancialHealth {
  customer_id: string;
  emi_to_income_ratio: number | null;
  savings_rate: number | null;
  expense_to_income_ratio: number | null;
  balance_trend: BalanceTrend | null;
  income_stability: number | null;
  history_months: number;
  confidence: number;
}

// ---------- Decision ----------

export type DecisionType = 'RECOMMEND' | 'INTERVENE' | 'VERIFY' | 'NO_ACTION';

export interface Decision {
  decision_id: string;
  customer_id: string;
  decision: DecisionType;
  confidence: number;
  reason_codes: string[];
  action: Record<string, unknown> | null;
  signals: Record<string, unknown> | null;
  policy_version: string;
  timestamp: string;
}

// ---------- Analysis request ----------

export interface AnalysisScope {
  financial_context?: boolean;
  behavioral_trends?: boolean;
  anomaly_analysis?: boolean;
}

export interface AnalyzeRequest {
  analysis_scope?: AnalysisScope;
}

export interface AnalyzeResponseData {
  decision: Decision;
}

// ---------- Consent update ----------

export type ConsentUpdateRequest = Consent;

// ---------- Feedback ----------

export type FeedbackEventType = 'ENGAGED' | 'IGNORED' | 'FOLLOW_UP' | 'DISMISSED';

export interface FeedbackRequest {
  event_type: FeedbackEventType;
  decision_id?: string;
  metadata?: Record<string, unknown>;
}

export interface Feedback {
  id: string;
  customer_id: string;
  decision_id: string | null;
  event_type: FeedbackEventType;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ---------- Audit ----------

/** One entry from the customer's decision audit log — an append-only
 * record of every decision ever made for them (Privacy page's "What we've
 * looked at" history). Deliberately not the same shape as `Decision`: no
 * `decision_id`/`customer_id`/`action`/`signals`, and the timestamp field
 * is named `audit_timestamp` rather than `timestamp`. */
export interface AuditEntry {
  decision: DecisionType;
  reason_codes: string[];
  confidence: number;
  policy_version: string;
  audit_timestamp: string;
}

// ---------- Simulation ----------

export interface HypotheticalLoan {
  principal: number;
  annual_interest_rate: number;
  tenure_months: number;
}

export interface SimulateRequest {
  loan: HypotheticalLoan;
}

export interface SimulationResult {
  current: FinancialHealth;
  hypothetical: FinancialHealth;
  decision: Decision;
}
