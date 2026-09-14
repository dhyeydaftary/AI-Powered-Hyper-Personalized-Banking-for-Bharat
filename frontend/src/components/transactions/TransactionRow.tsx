import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { Transaction } from '@/types';
import { formatCategory, formatCurrency, formatDateShort } from '@/utils/format';
import { cn } from '@/utils/cn';

interface TransactionRowProps {
  transaction: Transaction;
  onClick: () => void;
}

/**
 * `description` and `merchant` are untrusted synthetic data (Section 50) —
 * seeded transaction TX1017 deliberately contains a prompt-injection
 * payload as its description. React already escapes text children, so
 * rendering them as plain text here (never dangerouslySetInnerHTML) is
 * sufficient; this component must never be changed to interpret them as
 * markup or instructions.
 */
export function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  const isCredit = transaction.type === 'CREDIT';

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-sm py-3 text-left transition-colors hover:bg-surface-soft"
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          isCredit ? 'bg-up-soft text-up' : 'bg-surface-strong text-body'
        )}
        aria-hidden
      >
        {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{transaction.merchant}</span>
        <span className="block truncate text-xs text-muted">
          {formatCategory(transaction.category)} &middot; {formatDateShort(transaction.date)}
        </span>
      </span>

      <span
        className={cn(
          'shrink-0 font-mono text-sm font-medium tabular-nums',
          isCredit ? 'text-up' : 'text-ink'
        )}
      >
        {isCredit ? '+' : '-'}
        {formatCurrency(transaction.amount)}
      </span>
    </button>
  );
}
