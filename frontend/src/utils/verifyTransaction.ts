import type { Decision, Transaction } from '@/types';

/**
 * Finds the real transaction a VERIFY decision's `unusual_amount` signal
 * refers to. The backend does not put a transaction_id on the decision
 * object, so amount is the only reliable link available. If more than one
 * transaction shares the exact amount (ambiguous) or none does, callers
 * should fall back to amount-only copy rather than guessing which one —
 * never invent a transaction the data doesn't clearly point to.
 */
export function findMatchedTransaction(decision: Decision, transactions: Transaction[]): Transaction | null {
  const amount =
    decision.signals && typeof decision.signals.unusual_amount === 'number' ? decision.signals.unusual_amount : null;
  if (amount === null) return null;

  const candidates = transactions.filter((tx) => tx.type === 'DEBIT' && tx.amount === amount);
  return candidates.length === 1 ? candidates[0] : null;
}

/** Whether a transaction is the largest single debit in the customer's
 * fetched transaction history — used to ground the "why it matters" line
 * in a real comparison instead of an unqualified claim. */
export function isLargestDebit(transaction: Transaction, transactions: Transaction[]): boolean {
  const debits = transactions.filter((tx) => tx.type === 'DEBIT');
  if (debits.length === 0) return false;
  return debits.every((tx) => tx.amount <= transaction.amount);
}
