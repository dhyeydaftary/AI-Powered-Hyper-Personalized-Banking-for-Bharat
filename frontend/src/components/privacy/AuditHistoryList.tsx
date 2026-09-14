import { useEffect, useState } from 'react';
import { History, Loader2 } from 'lucide-react';
import { useDemoCustomer } from '@/state/demo-customer-context';
import { useAudit } from '@/hooks/useAudit';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { getDecisionTone } from '@/utils/decisionCopy';
import { getReasonHeadlines } from '@/utils/reasonCodes';
import { getConfidenceLabel, getConfidenceLevel } from '@/utils/confidence';
import { formatDate } from '@/utils/format';
import type { AuditEntry } from '@/types';

const PAGE_SIZE = 10;

const confidenceBadgeTone = { low: 'neutral', moderate: 'attention', high: 'positive' } as const;

function AuditRow({ entry, index }: { entry: AuditEntry; index: number }) {
  const tone = getDecisionTone(entry);
  const reasons = getReasonHeadlines(entry.reason_codes);
  const confidenceLevel = getConfidenceLevel(entry.confidence);

  return (
    <div className="flex flex-col gap-1.5 p-base" data-testid={`audit-row-${index}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted">{formatDate(entry.audit_timestamp.split('T')[0])}</span>
        <Badge tone={confidenceBadgeTone[confidenceLevel]}>{getConfidenceLabel(entry.confidence)} confidence</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={tone.tone}>{tone.label}</Badge>
        <span className="text-sm font-medium text-ink">{tone.headline}</span>
      </div>
      {reasons.length > 0 && (
        <p className="text-sm text-muted">{reasons.join(' · ')}</p>
      )}
    </div>
  );
}

/**
 * "What we've looked at" — a plain-language rendering of the real,
 * append-only decision audit log (GET /customers/:customerId/audit). A
 * real banking privacy center shows the customer what's been done with
 * their data; this reuses the same fetch/paginate/translate-reason-codes
 * pattern already established for transactions and decisions elsewhere in
 * the app, just pointed at a new endpoint.
 */
export function AuditHistoryList() {
  const { customerId } = useDemoCustomer();
  const [page, setPage] = useState(1);
  const [loadedItems, setLoadedItems] = useState<AuditEntry[]>([]);
  const [trackedCustomerId, setTrackedCustomerId] = useState(customerId);

  if (customerId !== trackedCustomerId) {
    setTrackedCustomerId(customerId);
    setPage(1);
    setLoadedItems([]);
  }

  const query = useAudit(customerId, page, PAGE_SIZE);

  useEffect(() => {
    if (!query.data) return;
    setLoadedItems((prev) => (page === 1 ? query.data.items : [...prev, ...query.data.items]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  const pagination = query.data?.pagination;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;
  const canLoadMore = pagination ? page < totalPages : false;
  const isInitialLoading = query.isLoading && loadedItems.length === 0;
  const isLoadingMore = page > 1 && query.isFetching;
  const loadMoreFailed = page > 1 && query.isError;

  if (isInitialLoading) {
    return <LoadingState message="Loading your decision history…" />;
  }

  if (query.isError && loadedItems.length === 0) {
    return (
      <ErrorState title="We couldn't load your decision history." error={query.error} onRetry={() => query.refetch()} />
    );
  }

  if (loadedItems.length === 0) {
    return (
      <EmptyState
        icon={<History size={22} />}
        title="Nothing on record yet"
        description="Once analysis has run for your account, what we looked at will show up here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col divide-y divide-hairline-soft rounded-lg border border-hairline bg-canvas">
        {loadedItems.map((entry, i) => (
          <AuditRow key={`${entry.audit_timestamp}-${i}`} entry={entry} index={i} />
        ))}
      </div>

      {pagination && pagination.total > pagination.limit && (
        <div className="flex flex-col items-center gap-2 pt-1">
          {canLoadMore &&
            (loadMoreFailed ? (
              <>
                <p className="text-sm text-down">We couldn&apos;t load more history.</p>
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
                  'Load more history'
                )}
              </Button>
            ))}
          <span className="text-xs text-muted">
            {`Showing ${loadedItems.length} of ${pagination.total} entries`}
          </span>
        </div>
      )}
    </div>
  );
}
