import type { Transaction } from '@/types';

/**
 * The backend's Transaction record has no UPI ID, reference number, or
 * counterparty-account field — none of that exists in the real contract,
 * so it can never be fetched. The customer asked for a more realistic
 * detail view anyway, so everything here is a DERIVED, DISPLAY-ONLY value:
 * deterministically synthesized from the transaction's own real fields
 * (id, merchant, category, type, date) using the actual formats those
 * identifiers follow in India's real payment rails —
 *
 *  - A UPI VPA is always `name@bank-handle` (e.g. `rahul.sharma@okaxis`).
 *  - A UPI reference number (the RRN banks and apps show you) is always
 *    exactly 12 digits, numeric only.
 *  - A NEFT/IMPS UTR is a bank-code prefix followed by a value date and a
 *    sequence number — real banks vary slightly in exact digit counts,
 *    which this does not claim to reproduce precisely.
 *  - A bank account is always shown masked to its last 4 digits.
 *
 * Same transaction in, same value out, every time — never random, never
 * sent anywhere, and never presented as if it came from the backend.
 */

export type PaymentMethod = 'UPI' | 'BANK_TRANSFER';

/** The product's own name (matches the `bharat-bank.*` localStorage key
 * prefix used elsewhere) — the bank whose account the customer is
 * actually banking with, so it's what "Paid by" / "Received in" shows. */
export const BANK_NAME = 'Bharat Bank';

const UPI_HANDLES = ['okaxis', 'oksbi', 'okhdfcbank', 'okicici', 'ybl', 'paytm', 'apl'] as const;
const BANK_CODES = ['HDFC', 'ICIC', 'SBIN', 'UTIB', 'KKBK', 'PUNB'] as const;

/** A small, stable string hash (not cryptographic) — only used so the
 * same transaction always renders the same synthesized identifiers. */
function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick<T>(list: readonly T[], seed: number): T {
  return list[seed % list.length];
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'user';
}

/** EMI and salary move over banking rails (NEFT/IMPS, or an auto-debit
 * mandate) — real payroll and loan EMIs are never a personal UPI handle.
 * Every other category here is the kind of routine, small-value payment
 * that in India overwhelmingly moves over UPI today. */
export function getPaymentMethod(transaction: Transaction): PaymentMethod {
  return transaction.category === 'SALARY' || transaction.category === 'EMI' ? 'BANK_TRANSFER' : 'UPI';
}

/** A UPI VPA in the real `name@handle` shape. A merchant name that reads
 * as "unknown" renders as a bare phone-number-style handle instead of a
 * named one — exactly the visual cue a real UPI app gives an unfamiliar
 * payee, which reinforces rather than undercuts a VERIFY flag. */
export function getUpiVpa(transaction: Transaction): string {
  const seed = hash(transaction.transaction_id + transaction.merchant);
  const handle = pick(UPI_HANDLES, seed);
  if (transaction.merchant.toLowerCase().includes('unknown')) {
    const phoneLike = 6000000000 + (seed % 4000000000);
    return `${phoneLike}@${handle}`;
  }
  return `${slugify(transaction.merchant)}@${handle}`;
}

/** UPI's real reference number (the RRN) is always exactly 12 digits. */
export function getUpiReferenceNumber(transaction: Transaction): string {
  const seed = hash(transaction.transaction_id + 'rrn');
  return String(100000000000 + seed);
}

/** A NEFT/IMPS-shaped UTR: a 4-letter bank code, the value date, and a
 * sequence number — the real structure banks build one from, even though
 * this doesn't claim to match any one bank's exact digit allocation. */
export function getBankReferenceNumber(transaction: Transaction): string {
  const seed = hash(transaction.transaction_id + 'utr');
  const bankCode = pick(BANK_CODES, seed);
  const compactDate = transaction.date.replace(/-/g, '');
  const sequence = String(100000 + (seed % 900000));
  return `${bankCode}${compactDate}${sequence}`;
}

/** The customer's own masked account number at Bharat Bank — the account
 * the money actually left from or landed in. Real bank UIs always mask
 * all but the last 4 digits; this is seeded by `customer_id`, not the
 * transaction, so the same customer's account number is consistent
 * across every one of their transactions, the way a real account is. */
export function getMaskedAccountNumber(transaction: Transaction): string {
  const seed = hash(transaction.customer_id + 'account');
  const last4 = String(1000 + (seed % 9000));
  return `•••• ${last4}`;
}

/** A plausible clock time for the transaction. The real `created_at`
 * field exists but every seeded record carries an identical midnight
 * timestamp, which would read as obviously synthetic if shown as-is; this
 * derives a believable time within ordinary waking hours instead, stable
 * per transaction. */
export function getTransactionTime(transaction: Transaction): string {
  const seed = hash(transaction.transaction_id + 'time');
  const hour24 = 8 + (seed % 14); // 8:00 AM – 9:59 PM
  const minute = (seed >>> 4) % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}
