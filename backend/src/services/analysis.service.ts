import { getCustomerById } from './customer.service';
import { getAllTransactionsForAnalysis } from './transaction.service';
import { getLoansByCustomer } from './loan.service';
import { getConsent } from './consent.service';
import { persistDecision } from './decision.service';
import { createAuditEntry } from './audit.service';
import {
  requestAnalysis,
  requestFinancialHealth,
  requestSimulation,
  type IntelligenceDecision,
  type FinancialHealth,
  type SimulationResult,
} from './intelligence.service';

/**
 * Analysis orchestration service.
 *
 * Implements the full analysis pipeline:
 *   Request → Validation → Authorization → Consent → Database
 *   → Intelligence Service → Validate Decision → Persist → Audit → Response
 *
 * Consent enforcement: filters analysis_scope based on actual customer consent.
 * The backend sends ONLY authorized data according to consent.
 */

interface AnalysisScope {
  financial_context: boolean;
  behavioral_trends: boolean;
  anomaly_analysis: boolean;
}

export async function runAnalysis(
  customerId: string,
  requestedScope: AnalysisScope
): Promise<IntelligenceDecision> {
  // 1. Load customer (validates existence)
  const customer = await getCustomerById(customerId);

  // 2. Load consent
  const consent = await getConsent(customerId);

  // 3. Determine permitted scope (consent MUST affect behavior)
  const effectiveScope: AnalysisScope = {
    financial_context: requestedScope.financial_context, // always allowed
    behavioral_trends: requestedScope.behavioral_trends && consent.behavioral_trend_analysis,
    anomaly_analysis: requestedScope.anomaly_analysis && consent.anomaly_analysis,
  };

  // 4. Load transactions and loans
  const transactions = await getAllTransactionsForAnalysis(customerId);
  const loans = await getLoansByCustomer(customerId);

  // 5. Build intelligence request with ONLY authorized data
  const intelligenceRequest = {
    customer: {
      customer_id: customer.customer_id,
      name: customer.name,
      age: customer.age,
      preferred_language: customer.preferred_language,
      monthly_income: customer.monthly_income,
    },
    transactions,
    loans,
    consent,
    analysis_scope: effectiveScope,
  };

  // 6. Call intelligence service (validated inside the service)
  const decision = await requestAnalysis(intelligenceRequest);

  // 7. Persist decision
  await persistDecision(decision);

  // 8. Create audit log (append-only)
  await createAuditEntry({
    decision_id: decision.decision_id,
    customer_id: decision.customer_id,
    decision: decision.decision,
    reason_codes: decision.reason_codes,
    confidence: decision.confidence,
    signals: decision.signals as Record<string, unknown> | null,
    action: decision.action as Record<string, unknown> | null,
    policy_version: decision.policy_version,
  });

  // 9. Return decision
  return decision;
}

export async function getFinancialHealth(customerId: string): Promise<FinancialHealth> {
  const customer = await getCustomerById(customerId);
  const consent = await getConsent(customerId);
  const transactions = await getAllTransactionsForAnalysis(customerId);
  const loans = await getLoansByCustomer(customerId);

  return requestFinancialHealth({
    customer: {
      customer_id: customer.customer_id,
      name: customer.name,
      age: customer.age,
      preferred_language: customer.preferred_language,
      monthly_income: customer.monthly_income,
    },
    transactions,
    loans,
    consent,
    analysis_scope: {
      financial_context: true,
      behavioral_trends: consent.behavioral_trend_analysis,
      anomaly_analysis: consent.anomaly_analysis,
    },
  });
}

export async function runSimulation(
  customerId: string,
  hypotheticalLoan: {
    principal: number;
    annual_interest_rate: number;
    tenure_months: number;
  }
): Promise<SimulationResult> {
  const customer = await getCustomerById(customerId);
  const consent = await getConsent(customerId);
  const transactions = await getAllTransactionsForAnalysis(customerId);
  const loans = await getLoansByCustomer(customerId);

  // Simulation does NOT create real loan records or mutate state
  return requestSimulation({
    customer: {
      customer_id: customer.customer_id,
      name: customer.name,
      age: customer.age,
      preferred_language: customer.preferred_language,
      monthly_income: customer.monthly_income,
    },
    transactions,
    loans,
    consent,
    analysis_scope: {
      financial_context: true,
      behavioral_trends: consent.behavioral_trend_analysis,
      anomaly_analysis: consent.anomaly_analysis,
    },
    simulation: {
      hypothetical_loan: hypotheticalLoan,
    },
  });
}
