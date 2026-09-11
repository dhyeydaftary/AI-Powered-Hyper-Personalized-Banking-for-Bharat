import prisma from '../config/database';
import { ensureCustomerExists } from './customer.service';

/**
 * Feedback service — simulated event log for the hackathon prototype.
 * Does NOT perform real-time model retraining.
 */

export async function createFeedback(data: {
  customer_id: string;
  decision_id?: string;
  event_type: 'ENGAGED' | 'IGNORED' | 'FOLLOW_UP' | 'DISMISSED';
  metadata: Record<string, unknown>;
}) {
  await ensureCustomerExists(data.customer_id);

  // Validate decision_id exists if provided
  if (data.decision_id) {
    const decision = await prisma.decision.findUnique({
      where: { decision_id: data.decision_id },
    });
    if (!decision) {
      // Still create feedback even if decision_id doesn't match —
      // the feedback is about the customer interaction, not necessarily a DB decision
    }
  }

  const feedback = await prisma.feedback.create({
    data: {
      customer_id: data.customer_id,
      decision_id: data.decision_id,
      event_type: data.event_type,
      metadata: data.metadata,
    },
  });

  return {
    id: feedback.id,
    customer_id: feedback.customer_id,
    decision_id: feedback.decision_id,
    event_type: feedback.event_type,
    metadata: feedback.metadata,
    created_at: feedback.created_at.toISOString(),
  };
}
