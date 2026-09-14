import prisma from '../config/database';
import { ensureCustomerExists } from './customer.service';
import { NotFoundError } from '../utils/errors';

export interface ConsentState {
  behavioral_trend_analysis: boolean;
  anomaly_analysis: boolean;
  vernacular_assistance: boolean;
}

export async function getConsent(customerId: string): Promise<ConsentState> {
  await ensureCustomerExists(customerId);

  const consent = await prisma.consent.findUnique({
    where: { customer_id: customerId },
  });

  if (!consent) {
    // Default consent if not yet created
    return {
      behavioral_trend_analysis: true,
      anomaly_analysis: true,
      vernacular_assistance: true,
    };
  }

  return {
    behavioral_trend_analysis: consent.behavioral_trend_analysis,
    anomaly_analysis: consent.anomaly_analysis,
    vernacular_assistance: consent.vernacular_assistance,
  };
}

export async function updateConsent(
  customerId: string,
  consentData: ConsentState
): Promise<ConsentState> {
  await ensureCustomerExists(customerId);

  const consent = await prisma.consent.upsert({
    where: { customer_id: customerId },
    update: {
      behavioral_trend_analysis: consentData.behavioral_trend_analysis,
      anomaly_analysis: consentData.anomaly_analysis,
      vernacular_assistance: consentData.vernacular_assistance,
    },
    create: {
      customer_id: customerId,
      behavioral_trend_analysis: consentData.behavioral_trend_analysis,
      anomaly_analysis: consentData.anomaly_analysis,
      vernacular_assistance: consentData.vernacular_assistance,
    },
  });

  return {
    behavioral_trend_analysis: consent.behavioral_trend_analysis,
    anomaly_analysis: consent.anomaly_analysis,
    vernacular_assistance: consent.vernacular_assistance,
  };
}
