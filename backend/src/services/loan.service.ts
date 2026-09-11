import prisma from '../config/database';
import { ensureCustomerExists } from './customer.service';

export async function getLoansByCustomer(customerId: string) {
  await ensureCustomerExists(customerId);

  const loans = await prisma.loan.findMany({
    where: { customer_id: customerId },
  });

  return loans.map((loan) => ({
    loan_id: loan.loan_id,
    customer_id: loan.customer_id,
    principal: Number(loan.principal),
    outstanding: Number(loan.outstanding),
    monthly_emi: Number(loan.monthly_emi),
    annual_interest_rate: Number(loan.annual_interest_rate),
    remaining_months: loan.remaining_months,
    created_at: loan.created_at,
    updated_at: loan.updated_at,
  }));
}
