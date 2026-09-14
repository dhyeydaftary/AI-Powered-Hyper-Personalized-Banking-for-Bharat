import { useEffect, useMemo, useState } from 'react';
import { Receipt, Loader2 } from 'lucide-react';
import { useDemoCustomer } from '@/state/demo-customer-context';
import { useTransactions } from '@/hooks/useTransactions';
import { ActivityTransactionRow } from '@/components/transactions/ActivityTransactionRow';
import { TransactionDetailDrawer } from '@/components/transactions/TransactionDetailDrawer';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionListSkeleton } from '@/components/transactions/TransactionListSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { relativeDateGroup } from '@/utils/format';
import { filterTransactions, sortTransactions, describeNoMatches, type SortOption } from '@/utils/transactionQuery';
import type { Transaction, TransactionCategory } from '@/types';

const PAGE_SIZE = 20;
const DEFAULT_SORT: SortOption = 'date_desc';

export function TransactionsPage() {
  const { customerId } = useDemoCustomer();
  const [page, setPage] = useState(1);
  const [loadedItems, setLoadedItems] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Set<TransactionCategory>>(new Set());
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [trackedCustomerId, setTrackedCustomerId] = useState(customerId);

  // Switching the demo customer resets pagination, accumulation, and
  // filters *before* the query below fires — done during render (React's
  // documented pattern for "reset state when a prop changes"), not in a
  // useEffect, so `useTransactions` is never called with a stale page
  // number left over from the previous customer for even one request.
  if (customerId !== trackedCustomerId) {
    setTrackedCustomerId(customerId);
    setPage(1);
    setLoadedItems([]);
    setSearch('');
    setCategories(new Set());
    setSort(DEFAULT_SORT);
    setSelectedTx(null);
  }

  const query = useTransactions(customerId, page, PAGE_SIZE);

  // The backend paginates; the client accumulates pages as "Load more" is
  // used, so search/filter/sort can operate over everything fetched so
  // far rather than just whichever 20-item page happens to be current.
  // `placeholderData` on useTransactions can briefly surface the previous
  // customer's cached page during a switch, so items are only accepted
  // here if they actually belong to the customer currently being viewed —
  // never merge another customer's transactions into this list, even for
  // an instant.
  useEffect(() => {
    if (!query.data) return;
    const ownTransactions = query.data.items.filter((tx) => tx.customer_id === customerId);
    if (ownTransactions.length === 0) return;
    setLoadedItems((prev) => {
      const merged = new Map(prev.map((tx) => [tx.transaction_id, tx]));
      for (const tx of ownTransactions) merged.set(tx.transaction_id, tx);
      return Array.from(merged.values());
    });
  }, [query.data, customerId]);

  const filtered = useMemo(() => filterTransactions(loadedItems, { search, categories }), [loadedItems, search, categories]);
  const sorted = useMemo(() => sortTransactions(filtered, sort), [filtered, sort]);

  // Grouping by time bucket only makes sense for the natural newest-first
  // order — once the customer picks a different sort, a flat list sorted
  // exactly the way they asked for is clearer than buckets that no longer
  // match the visible order.
  const isDefaultSort = sort === DEFAULT_SORT;
  const groups = useMemo(() => {
    if (!isDefaultSort) return [];
    const map = new Map<string, Transaction[]>();
    for (const tx of sorted) {
      const key = relativeDateGroup(tx.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    }
    return Array.from(map.entries());
  }, [sorted, isDefaultSort]);

  const pagination = query.data?.pagination;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;
  const canLoadMore = pagination ? page < totalPages : false;

  const isInitialLoading = query.isLoading && loadedItems.length === 0;
  const isLoadingMore = page > 1 && query.isFetching;
  const loadMoreFailed = page > 1 && query.isError;

  const hasActiveFilters = search.trim().length > 0 || categories.size > 0;

  const clearFilters = () => {
    setSearch('');
    setCategories(new Set());
  };

  const toggleCategory = (category: TransactionCategory) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="text-xl font-semibold text-ink sm:text-2xl">Activity</h1>
        <p className="mt-1 text-sm text-muted">All the money moving in and out of your account.</p>
      </div>

      <TransactionFilters
        search={search}
        onSearchChange={setSearch}
        categories={categories}
        onToggleCategory={toggleCategory}
        onClearCategories={() => setCategories(new Set())}
        sort={sort}
        onSortChange={setSort}
      />

      {isInitialLoading ? (
        <TransactionListSkeleton />
      ) : query.isError && loadedItems.length === 0 ? (
        <ErrorState title="We couldn't load your transactions." error={query.error} onRetry={() => query.refetch()} />
      ) : loadedItems.length === 0 ? (
        <EmptyState
          icon={<Receipt size={22} />}
          title="No recent transactions"
          description="There are no transactions to display for this period."
        />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No matching transactions"
          description={describeNoMatches(search, categories)}
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : isDefaultSort ? (
        <div className="flex flex-col gap-lg">
          {groups.map(([label, txs]) => (
            <div key={label}>
              <h3 className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-muted">{label}</h3>
              <div className="rounded-lg border border-hairline bg-canvas p-1">
                {txs.map((tx) => (
                  <ActivityTransactionRow key={tx.transaction_id} transaction={tx} onClick={() => setSelectedTx(tx)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-hairline bg-canvas p-1">
          {sorted.map((tx) => (
            <ActivityTransactionRow key={tx.transaction_id} transaction={tx} onClick={() => setSelectedTx(tx)} />
          ))}
        </div>
      )}

      {loadedItems.length > 0 && pagination && pagination.total > pagination.limit && (
        <div className="flex flex-col items-center gap-2 pt-2">
          {canLoadMore &&
            (loadMoreFailed ? (
              <>
                <p className="text-sm text-down">We couldn&apos;t load more transactions.</p>
                <Button variant="outline" size="sm" onClick={() => query.refetch()}>
                  Retry
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={isLoadingMore}>
                {isLoadingMore ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Loading…
                  </>
                ) : (
                  'Load more transactions'
                )}
              </Button>
            ))}
          <span className="text-xs text-muted">
            {`Showing ${loadedItems.length} of ${pagination.total} transactions`}
          </span>
        </div>
      )}

      <TransactionDetailDrawer transaction={selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)} />
    </div>
  );
}
