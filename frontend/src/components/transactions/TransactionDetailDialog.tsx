import type { ReactNode } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import type { Transaction } from '@/types';
import { formatCategory, formatCurrency, formatDate, formatTransactionType } from '@/utils/format';

interface TransactionDetailDialogProps {
  transaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
}

/** There is no dedicated transaction-detail endpoint (Section 30) — this
 * renders only the fields already present on the list item. Merchant and
 * description are rendered as plain text, never as HTML. */
export function TransactionDetailDialog({ transaction, onOpenChange }: TransactionDetailDialogProps) {
  return (
    <Dialog open={!!transaction} onOpenChange={onOpenChange} title="Transaction details">
      {transaction && (
        <div className="flex flex-col gap-lg">
          <div>
            <p className="font-mono text-2xl font-medium tabular-nums text-ink">
              {transaction.type === 'CREDIT' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
            <p className="mt-1 text-sm text-muted">{transaction.description}</p>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            <Field label="Merchant" value={transaction.merchant} />
            <Field label="Date" value={formatDate(transaction.date)} />
            <Field label="Category" value={<Badge>{formatCategory(transaction.category)}</Badge>} />
            <Field label="Type" value={formatTransactionType(transaction.type)} />
          </dl>
        </div>
      )}
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
