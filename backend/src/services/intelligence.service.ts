import { env } from '../config/env';
import { ExternalServiceError, ServiceUnavailableError } from '../utils/errors';
import { intelligenceDecisionSchema, financialHealthSchema } from '../validators';
import type { ConsentState } from './consent.service';

/**
 * Intelligence Service Client.
 *
 * Communicates with the intelligence service over HTTP.
 * When the real service is unavailable, falls back to a deterministic
 * mock that produces valid decisions for demo reliability.
 *
 * The backend NEVER fabricates decisions — the mock simulates what the
 * intelligence service would return based on observable financial signals.
 */

interface AnalysisRequest {
  customer: {
    customer_id: string;
    name: string;
    age: number;
    preferred_language: string;
    monthly_income: number;
  };
  transactions: Array<{
    transaction_id: string;
    customer_id: string;
    date: string;
    amount: number;
    type: string;
    category: string;
    description: string;
    merchant: string;
  }>;
  loans: Array<{
    loan_id: string;
    customer_id: string;
    principal: number;
    outstanding: number;
    monthly_emi: number;
    annual_interest_rate: number;
    remaining_months: number;
  }>;
  consent: ConsentState;
  analysis_scope: {
    financial_context: boolean;
    behavioral_trends: boolean;
    anomaly_analysis: boolean;
  };
}

interface SimulationRequest extends AnalysisRequest {
  simulation: {
    hypothetical_loan: {
      principal: number;
      annual_interest_rate: number;
      tenure_months: number;
    };
  };
}

export interface IntelligenceDecision {
  decision_id: string;
  customer_id: string;
  decision: 'RECOMMEND' | 'INTERVENE' | 'VERIFY' | 'NO_ACTION';
  confidence: number;
  reason_codes: string[];
  signals: Record<string, unknown> | null;
  action: Record<string, unknown> | null;
  policy_version: string;
  timestamp: string;
}

export interface FinancialHealth {
  customer_id: string;
  emi_to_income_ratio: number | null;
  savings_rate: number | null;
  expense_to_income_ratio: number | null;
  balance_trend: string | null;
  income_stability: number | null;
  history_months: number;
  confidence: number;
}

export interface SimulationResult {
  current: FinancialHealth;
  hypothetical: FinancialHealth;
  decision: IntelligenceDecision;
}

// ─── HTTP Client ──────────────────────────────────────────

async function fetchFromIntelligence<T>(path: string, body: unknown): Promise<T> {
  const url = `${env.INTELLIGENCE_URL}${path}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new ExternalServiceError(
        `Intelligence service returned ${response.status}: ${response.statusText}`
      );
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ExternalServiceError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ServiceUnavailableError('Intelligence service request timed out');
    }
    // Connection refused, DNS failure, etc.
    throw new ServiceUnavailableError(
      'Intelligence service is unavailable. Ensure it is running at ' + env.INTELLIGENCE_URL
    );
  }
}

// ─── Public API ───────────────────────────────────────────

export async function requestAnalysis(
  request: AnalysisRequest
): Promise<IntelligenceDecision> {
  try {
    const raw = await fetchFromIntelligence<unknown>('/analyze', request);
    const validated = intelligenceDecisionSchema.parse(raw);
    return validated as IntelligenceDecision;
  } catch (err: unknown) {
    if (
      err instanceof ExternalServiceError ||
      err instanceof ServiceUnavailableError
    ) {
      // Fall back to mock for demo reliability
      console.warn('[intelligence] Service unavailable, using mock fallback');
      return generateMockDecision(request);
    }
    throw err;
  }
}

export async function requestFinancialHealth(
  request: AnalysisRequest
): Promise<FinancialHealth> {
  try {
    const raw = await fetchFromIntelligence<unknown>('/financial-health', request);
    const validated = financialHealthSchema.parse(raw);
    return validated as FinancialHealth;
  } catch (err: unknown) {
    if (
      err instanceof ExternalServiceError ||
      err instanceof ServiceUnavailableError
    ) {
      console.warn('[intelligence] Service unavailable, using mock financial health');
      return generateMockFinancialHealth(request);
    }
    throw err;
  }
}

export async function requestSimulation(
  request: SimulationRequest
): Promise<SimulationResult> {
  try {
    const raw = await fetchFromIntelligence<unknown>('/simulate', request);

    // Validate sub-objects
    const result = raw as Record<string, unknown>;
    const current = financialHealthSchema.parse(result.current);
    const hypothetical = financialHealthSchema.parse(result.hypothetical);
    const decision = intelligenceDecisionSchema.parse(result.decision);

    return {
      current: current as FinancialHealth,
      hypothetical: hypothetical as FinancialHealth,
      decision: decision as IntelligenceDecision,
    };
  } catch (err: unknown) {
    if (
      err instanceof ExternalServiceError ||
      err instanceof ServiceUnavailableError
    ) {
      console.warn('[intelligence] Service unavailable, using mock simulation');
      return generateMockSimulation(request);
    }
    throw err;
  }
}

// ─── Mock Fallback (demo reliability) ─────────────────────
// These compute basic signals from raw data so the demo works
// without the intelligence service. This is NOT the decision engine —
// just a deterministic stub for development/demo.

function computeBasicSignals(request: AnalysisRequest) {
  const income = request.customer.monthly_income;
  const totalEmi = request.loans.reduce((sum, l) => sum + l.monthly_emi, 0);
  const emiToIncomeRatio = income > 0 ? totalEmi / income : 0;

  const debits = request.transactions
    .filter((t) => t.type === 'DEBIT')
    .reduce((sum, t) => sum + t.amount, 0);
  const credits = request.transactions
    .filter((t) => t.type === 'CREDIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const months = new Set(request.transactions.map((t) => t.date.substring(0, 7))).size;
  const avgMonthlyDebit = months > 0 ? debits / months : debits;
  const expenseToIncomeRatio = income > 0 ? avgMonthlyDebit / income : 0;
  const savingsRate = income > 0 ? Math.max(0, (income - avgMonthlyDebit) / income) : 0;

  // Check for unusual transactions (amount > 80% of monthly income)
  const unusualTx = request.transactions.find(
    (t) => t.type === 'DEBIT' && t.amount > income * 0.8
  );

  return {
    emiToIncomeRatio: Math.round(emiToIncomeRatio * 100) / 100,
    savingsRate: Math.round(savingsRate * 100) / 100,
    expenseToIncomeRatio: Math.round(expenseToIncomeRatio * 100) / 100,
    months,
    unusualTx,
    totalEmi,
  };
}

function generateMockDecision(request: AnalysisRequest): IntelligenceDecision {
  const signals = computeBasicSignals(request);
  const timestamp = new Date().toISOString();
  const decisionId = `DEC-MOCK-${Date.now()}`;

  // Thin-file → NO_ACTION
  if (signals.months <= 1) {
    return {
      decision_id: decisionId,
      customer_id: request.customer.customer_id,
      decision: 'NO_ACTION',
      confidence: 0.35,
      reason_codes: ['INSUFFICIENT_HISTORY', 'LOW_DATA_CONFIDENCE'],
      signals: {
        emi_to_income_ratio: signals.emiToIncomeRatio,
        savings_rate: signals.savingsRate,
        expense_to_income_ratio: signals.expenseToIncomeRatio,
        history_months: signals.months,
      },
      action: null,
      policy_version: 'v1.0-mock',
      timestamp,
    };
  }

  // Unusual transaction → VERIFY (if anomaly analysis is in scope)
  if (signals.unusualTx && request.analysis_scope.anomaly_analysis) {
    return {
      decision_id: decisionId,
      customer_id: request.customer.customer_id,
      decision: 'VERIFY',
      confidence: 0.72,
      reason_codes: ['UNUSUAL_TRANSACTION'],
      signals: {
        emi_to_income_ratio: signals.emiToIncomeRatio,
        savings_rate: signals.savingsRate,
        unusual_amount: signals.unusualTx.amount,
        history_months: signals.months,
      },
      action: null,
      policy_version: 'v1.0-mock',
      timestamp,
    };
  }

  // High stress → INTERVENE
  if (signals.emiToIncomeRatio > 0.35 || signals.savingsRate < 0.10) {
    const reasonCodes: string[] = [];
    if (signals.emiToIncomeRatio > 0.35) reasonCodes.push('HIGH_EMI_BURDEN');
    if (signals.savingsRate < 0.10) reasonCodes.push('DECLINING_SAVINGS');
    if (signals.expenseToIncomeRatio > 0.75) reasonCodes.push('RISING_EXPENSE_RATIO');

    return {
      decision_id: decisionId,
      customer_id: request.customer.customer_id,
      decision: 'INTERVENE',
      confidence: 0.87,
      reason_codes: reasonCodes,
      signals: {
        emi_to_income_ratio: signals.emiToIncomeRatio,
        savings_rate: signals.savingsRate,
        expense_to_income_ratio: signals.expenseToIncomeRatio,
        history_months: signals.months,
      },
      action: null,
      policy_version: 'v1.0-mock',
      timestamp,
    };
  }

  // Healthy → RECOMMEND
  return {
    decision_id: decisionId,
    customer_id: request.customer.customer_id,
    decision: 'RECOMMEND',
    confidence: 0.86,
    reason_codes: ['HEALTHY_FINANCIAL_TREND', 'STABLE_INCOME'],
    signals: {
      emi_to_income_ratio: signals.emiToIncomeRatio,
      savings_rate: signals.savingsRate,
      expense_to_income_ratio: signals.expenseToIncomeRatio,
      history_months: signals.months,
    },
    action: null,
    policy_version: 'v1.0-mock',
    timestamp,
  };
}

function generateMockFinancialHealth(request: AnalysisRequest): FinancialHealth {
  const signals = computeBasicSignals(request);

  return {
    customer_id: request.customer.customer_id,
    emi_to_income_ratio: signals.emiToIncomeRatio,
    savings_rate: signals.savingsRate,
    expense_to_income_ratio: signals.expenseToIncomeRatio,
    balance_trend: signals.savingsRate > 0.15 ? 'STABLE' : 'DECLINING',
    income_stability: 0.91,
    history_months: signals.months,
    confidence: signals.months >= 3 ? 0.86 : 0.45,
  };
}

function generateMockSimulation(request: SimulationRequest): SimulationResult {
  const current = generateMockFinancialHealth(request);

  // Calculate hypothetical EMI for new loan
  const { principal, annual_interest_rate, tenure_months } = request.simulation.hypothetical_loan;
  const monthlyRate = annual_interest_rate / 12 / 100;
  let hypotheticalEmi: number;
  if (monthlyRate === 0) {
    hypotheticalEmi = principal / tenure_months;
  } else {
    hypotheticalEmi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure_months)) /
      (Math.pow(1 + monthlyRate, tenure_months) - 1);
  }
  hypotheticalEmi = Math.round(hypotheticalEmi * 100) / 100;

  const currentTotalEmi = request.loans.reduce((sum, l) => sum + l.monthly_emi, 0);
  const newTotalEmi = currentTotalEmi + hypotheticalEmi;
  const income = request.customer.monthly_income;
  const newEmiRatio = income > 0 ? Math.round((newTotalEmi / income) * 100) / 100 : 0;
  const currentExpense = (current.expense_to_income_ratio ?? 0) * income;
  const newExpenseRatio = income > 0
    ? Math.round(((currentExpense + hypotheticalEmi) / income) * 100) / 100
    : 0;
  const newSavingsRate = income > 0
    ? Math.round(Math.max(0, (income - currentExpense - hypotheticalEmi) / income) * 100) / 100
    : 0;

  const hypothetical: FinancialHealth = {
    customer_id: request.customer.customer_id,
    emi_to_income_ratio: newEmiRatio,
    savings_rate: newSavingsRate,
    expense_to_income_ratio: newExpenseRatio,
    balance_trend: newSavingsRate > 0.10 ? 'STABLE' : 'DECLINING',
    income_stability: current.income_stability,
    history_months: current.history_months,
    confidence: current.confidence,
  };

  // Simulate decision based on hypothetical scenario
  const simRequest: AnalysisRequest = {
    ...request,
    loans: [
      ...request.loans,
      {
        loan_id: 'SIM-LOAN',
        customer_id: request.customer.customer_id,
        principal,
        outstanding: principal,
        monthly_emi: hypotheticalEmi,
        annual_interest_rate,
        remaining_months: tenure_months,
      },
    ],
  };
  const decision = generateMockDecision(simRequest);

  return { current, hypothetical, decision };
}
