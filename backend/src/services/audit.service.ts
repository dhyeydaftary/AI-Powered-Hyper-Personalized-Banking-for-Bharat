import prisma from '../config/database';
import { ensureCustomerExists } from './customer.service';

/**
 * Audit log service.
 * Append-only — never updates or deletes historical entries.
 */

export async function createAuditEntry(data: {
  decision_id: string;
  customer_id: string;
  decision: 'RECOMMEND' | 'INTERVENE' | 'VERIFY' | 'NO_ACTION';
  reason_codes: string[];
  confidence: number;
  signals: Record<string, unknown> | null;
  action: Record<string, unknown> | null;
  policy_version: string;
}) {
  return prisma.auditLog.create({
    data: {
      decision_id: data.decision_id,
      customer_id: data.customer_id,
      decision: data.decision,
      reason_codes: data.reason_codes,
      confidence: data.confidence,
      signals: data.signals ?? undefined,
      action: data.action ?? undefined,
      policy_version: data.policy_version,
    },
  });
}

export async function getAuditLogsByCustomer(
  customerId: string,
  page: number,
  limit: number
) {
  await ensureCustomerExists(customerId);

  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { customer_id: customerId },
      orderBy: { audit_timestamp: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where: { customer_id: customerId } }),
  ]);

  return {
    entries: entries.map((e) => ({
      id: e.id,
      decision_id: e.decision_id,
      customer_id: e.customer_id,
      decision: e.decision,
      reason_codes: e.reason_codes,
      confidence: e.confidence,
      signals: e.signals,
      action: e.action,
      policy_version: e.policy_version,
      audit_timestamp: e.audit_timestamp.toISOString(),
    })),
    pagination: { page, limit, total },
  };
}
