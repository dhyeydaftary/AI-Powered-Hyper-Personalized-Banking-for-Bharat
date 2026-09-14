import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { TransactionCategory } from '@/types';
import { formatCategory } from '@/utils/format';
import { useTranslation } from '@/i18n';
import { SORT_OPTIONS, type SortOption } from '@/utils/transactionQuery';
import { cn } from '@/utils/cn';

const CATEGORIES: TransactionCategory[] = [
  'SALARY',
  'EMI',
  'GROCERIES',
  'RENT',
  'UTILITIES',
  'SHOPPING',
  'TRAVEL',
  'HEALTH',
  'TRANSFER',
  'OTHER',
];

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categories: Set<TransactionCategory>;
  onToggleCategory: (category: TransactionCategory) => void;
  onClearCategories: () => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

/**
 * The backend supports ?page=&limit= only — no server-side search, filter,
 * or sort (Section 13/29). This operates entirely over the transactions
 * already fetched (accumulated across "Load more" pages), never as query
 * parameters the backend wouldn't understand.
 *
 * Category selection is multi-select via toggle chips — real categories
 * only (`SALARY`, `EMI`, `GROCERIES`, `RENT`, `UTILITIES`, `SHOPPING`,
 * `TRAVEL`, `HEALTH`, `TRANSFER`, `OTHER`), nothing invented.
 */
export function TransactionFilters({
  search,
  onSearchChange,
  categories,
  onToggleCategory,
  onClearCategories,
  sort,
  onSortChange,
}: TransactionFiltersProps) {
  const t = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.transactions.search}
            className="pl-9"
            aria-label={t.transactions.search}
          />
        </div>
        <Select
          value={sort}
          onValueChange={(value) => onSortChange(value as SortOption)}
          ariaLabel={t.transactions.sort}
          className="sm:w-56"
          options={SORT_OPTIONS}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.transactions.filterByCategory}>
        {CATEGORIES.map((c) => {
          const selected = categories.has(c);
          return (
            <button
              key={c}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggleCategory(c)}
              className={cn(
                'rounded-pill border px-sm py-1 text-xs font-medium transition-colors',
                selected
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-hairline bg-canvas text-body hover:bg-surface-soft'
              )}
            >
              {formatCategory(c)}
            </button>
          );
        })}
        {categories.size > 0 && (
          <button
            type="button"
            onClick={onClearCategories}
            className="rounded-pill px-sm py-1 text-xs font-medium text-primary hover:underline"
          >
            {t.transactions.clearCategories}
          </button>
        )}
      </div>
    </div>
  );
}
