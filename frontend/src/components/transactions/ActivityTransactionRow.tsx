import type { Transaction } from '@/types';
import { getCategoryIcon } from '@/utils/categoryVisuals';
import { formatCategory, formatCurrency, formatDateShort } from '@/utils/format';
import { cn } from '@/utils/cn';

interface ActivityTransactionRowProps {
  transaction: Transaction;
  onClick: () => void;
}

/**
 * The Activity page's own row — kept separate from the shared
 * `TransactionRow` (still used by Overview's "Recent activity" summary,
 * which this pass must not visually change) so this page can go further:
 * a category-specific icon and a money-direction color driven by the
 * real `type` field.
 *
 * `description` and `merchant` are untrusted synthetic data — seeded
 * transaction TX1017 deliberately contains a prompt-injection payload as
 * its description. React already escapes text children, so rendering
 * them as plain text here (never dangerouslySetInnerHTML) is sufficient;
 * this component must never be changed to interpret them as markup or
 * instructions.
 *
 * Two visual signals, deliberately kept separate: the leading icon shows
 * *what kind* of transaction this is (category — always neutral in
 * color, only the glyph varies), while the amount's color shows *money
 * in vs. out*, driven by the real `type` field rather than any specific
 * category name, so it is correct for every category without a special
 * case for "SALARY" or any other one.
 */
export function ActivityTransactionRow({ transaction, onClick }: ActivityTransactionRowProps) {
  const isCredit = transaction.type === 'CREDIT';
  const CategoryIcon = getCategoryIcon(transaction.category);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full animate-fade-in items-center gap-3 rounded-md px-sm py-3 text-left transition-all duration-150 ease-out hover:bg-surface-soft active:scale-[0.98]"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-strong text-body"
        aria-hidden
      >
        <CategoryIcon size={16} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{transaction.merchant}</span>
        <span className="block truncate text-xs text-muted">
          {formatCategory(transaction.category)} &middot; {formatDateShort(transaction.date)}
        </span>
      </span>

      <span
        className={cn('shrink-0 font-mono text-sm font-semibold tabular-nums', isCredit ? 'text-up' : 'text-down')}
      >
        {isCredit ? '+' : '-'}
        {formatCurrency(transaction.amount)}
      </span>
    </button>
  );
}
