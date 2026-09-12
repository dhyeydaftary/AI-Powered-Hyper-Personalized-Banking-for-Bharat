import prisma from '../config/database';
import { ensureCustomerExists } from './customer.service';

export async function getTransactionsByCustomer(
  customerId: string,
  page: number,
  limit: number
) {
  await ensureCustomerExists(customerId);

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { customer_id: customerId },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where: { customer_id: customerId } }),
  ]);

  return {
    transactions: transactions.map((tx: any) => ({
      transaction_id: tx.transaction_id,
      customer_id: tx.customer_id,
      date: tx.date.toISOString().split('T')[0],
      amount: Number(tx.amount),
      type: tx.type,
      category: tx.category,
      description: tx.description,
      merchant: tx.merchant,
      created_at: tx.created_at,
    })),
    pagination: { page, limit, total },
  };
}

export async function getAllTransactionsForAnalysis(customerId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { customer_id: customerId },
    orderBy: { date: 'asc' },
  });

  return transactions.map((tx: any) => ({
    transaction_id: tx.transaction_id,
    customer_id: tx.customer_id,
    date: tx.date.toISOString().split('T')[0],
    amount: Number(tx.amount),
    type: tx.type,
    category: tx.category,
    description: tx.description,
    merchant: tx.merchant,
  }));
}
