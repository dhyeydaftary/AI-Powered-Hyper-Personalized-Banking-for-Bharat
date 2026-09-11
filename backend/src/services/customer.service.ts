import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';

export async function getCustomerById(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { customer_id: customerId },
    include: { consent: true },
  });

  if (!customer) {
    throw new NotFoundError(`Customer ${customerId} not found`);
  }

  return {
    customer_id: customer.customer_id,
    name: customer.name,
    age: customer.age,
    preferred_language: customer.preferred_language,
    monthly_income: Number(customer.monthly_income),
    consent: customer.consent
      ? {
          behavioral_trend_analysis: customer.consent.behavioral_trend_analysis,
          anomaly_analysis: customer.consent.anomaly_analysis,
          vernacular_assistance: customer.consent.vernacular_assistance,
        }
      : null,
    created_at: customer.created_at,
    updated_at: customer.updated_at,
  };
}

export async function ensureCustomerExists(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { customer_id: customerId },
  });
  if (!customer) {
    throw new NotFoundError(`Customer ${customerId} not found`);
  }
  return customer;
}
