import type { ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { getCategoryIcon } from '@/utils/categoryVisuals';
import type { Transaction } from '@/types';
import { formatCategory, formatCurrency, formatDate, formatTransactionType } from '@/utils/format';
import {
  BANK_NAME,
  getPaymentMethod,
  getUpiVpa,
  getUpiReferenceNumber,
  getBankReferenceNumber,
  getMaskedAccountNumber,
  getTransactionTime,
} from '@/utils/paymentDetails';
import { cn } from '@/utils/cn';

interface TransactionDetailDrawerProps {
  transaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ label, value, sub, mono }: { label: string; value: ReactNode; sub?: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-right">
        <span className={cn('block text-sm font-medium text-ink', mono && 'font-mono')}>{value}</span>
        {sub && <span className="mt-0.5 block font-mono text-xs text-muted">{sub}</span>}
      </span>
    </div>
  );
}

/**
 * The Activity page's own transaction detail view — a side drawer rather
 * than a center dialog, so it opens anchored to the list it came from
 * instead of a disconnected floating box (apple-design's spatial-
 * consistency guidance). Kept separate from the shared
 * `TransactionDetailDialog` (still used by Overview, which this pass
 * must not change).
 *
 * The backend has no UPI ID, reference number, timestamp, or account
 * field — none of that is part of the real Transaction contract. At the
 * customer's request this view shows a fuller, receipt-style set of
 * details anyway, laid out as one stacked card the way GPay/PhonePe show
 * a transaction — everything here beyond merchant/amount/date/category/
 * type is a value DERIVED from the transaction's own real fields in the
 * real format that identifier follows (see `utils/paymentDetails.ts`):
 * deterministic per transaction, never fetched, never random, and never
 * presented as if the backend returned it.
 *
 * Merchant and description are untrusted synthetic data (seeded
 * transaction TX1017 deliberately contains a prompt-injection payload as
 * its description) and are rendered as plain text children only — never
 * dangerouslySetInnerHTML, never passed to any LLM-facing prompt.
 */
export function TransactionDetailDrawer({ transaction, onOpenChange }: TransactionDetailDrawerProps) {
  const isCredit = transaction?.type === 'CREDIT';
  const CategoryIcon = transaction ? getCategoryIcon(transaction.category) : null;
  const paymentMethod = transaction ? getPaymentMethod(transaction) : null;
  const isUpi = paymentMethod === 'UPI';

  return (
    <Drawer open={!!transaction} onOpenChange={onOpenChange} title="Transaction details">
      {transaction && (
        <div className="flex flex-col gap-lg">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-strong text-body"
              aria-hidden
            >
              {CategoryIcon && <CategoryIcon size={18} />}
            </span>
            <p className="min-w-0 truncate text-base font-semibold text-ink">{transaction.merchant}</p>
          </div>

          <div>
            <p className={cn('font-mono text-3xl font-semibold tabular-nums', isCredit ? 'text-up' : 'text-down')}>
              {isCredit ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
            {transaction.description && <p className="mt-2 text-sm text-muted">{transaction.description}</p>}
          </div>

          <div className="flex flex-col divide-y divide-hairline-soft rounded-lg border border-hairline bg-canvas px-base">
            <DetailRow
              label="Status"
              value={
                <span className="inline-flex items-center gap-1.5 text-up">
                  <CheckCircle2 size={14} /> Completed
                </span>
              }
            />
            <DetailRow label="Date & time" value={`${formatDate(transaction.date)} · ${getTransactionTime(transaction)}`} />
            <DetailRow label="Type" value={formatTransactionType(transaction.type)} />
            <DetailRow
              label={isCredit ? 'Received from' : 'Paid to'}
              value={transaction.merchant}
              sub={isUpi ? getUpiVpa(transaction) : undefined}
            />
            <DetailRow
              label={isCredit ? 'Received in' : 'Paid by'}
              value={`${BANK_NAME} ${getMaskedAccountNumber(transaction)}`}
            />
            <DetailRow
              label={isUpi ? 'UPI transaction ID' : 'Bank reference (UTR)'}
              value={isUpi ? getUpiReferenceNumber(transaction) : getBankReferenceNumber(transaction)}
              mono
            />
            <DetailRow label="Category" value={formatCategory(transaction.category)} />
            <DetailRow label="Payment method" value={isUpi ? 'UPI' : 'Bank transfer'} />
          </div>
        </div>
      )}
    </Drawer>
  );
}
