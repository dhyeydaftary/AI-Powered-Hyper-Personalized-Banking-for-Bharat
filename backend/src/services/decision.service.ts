import prisma from '../config/database';
import { ensureCustomerExists } from './customer.service';

export async function getLatestDecision(customerId: string) {
  await ensureCustomerExists(customerId);

  const decision = await prisma.decision.findFirst({
    where: { customer_id: customerId },
    orderBy: { timestamp: 'desc' },
  });

  if (!decision) {
    return null;
  }

  return {
    decision_id: decision.decision_id,
    customer_id: decision.customer_id,
    decision: decision.decision,
    confidence: decision.confidence,
    reason_codes: decision.reason_codes,
    signals: decision.signals,
    action: decision.action,
    policy_version: decision.policy_version,
    timestamp: decision.timestamp.toISOString(),
  };
}

export async function persistDecision(data: {
  decision_id: string;
  customer_id: string;
  decision: 'RECOMMEND' | 'INTERVENE' | 'VERIFY' | 'NO_ACTION';
  confidence: number;
  reason_codes: string[];
  signals: Record<string, unknown> | null;
  action: Record<string, unknown> | null;
  policy_version: string;
  timestamp: string;
}) {
  const decision = await prisma.decision.create({
    data: {
      decision_id: data.decision_id,
      customer_id: data.customer_id,
      decision: data.decision,
      confidence: data.confidence,
      reason_codes: data.reason_codes,
      signals: (data.signals as any) ?? undefined,
      action: (data.action as any) ?? undefined,
      policy_version: data.policy_version,
      timestamp: new Date(data.timestamp),
    },
  });

  return decision;
}
