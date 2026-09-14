import { Skeleton } from '@/components/ui/LoadingState';

/**
 * A skeleton shaped like the real grouped list (a group label followed by
 * a handful of icon/text/amount rows) rather than a generic spinner over
 * blank space, so the loading state doesn't look like a different page
 * from the one about to appear.
 */
export function TransactionListSkeleton() {
  const groups = [3, 2];

  return (
    <div className="flex flex-col gap-lg" role="status" aria-label="Loading your transactions">
      {groups.map((rowCount, groupIndex) => (
        <div key={groupIndex}>
          <Skeleton className="mb-1 ml-1 h-3 w-20" />
          <div className="rounded-lg border border-hairline bg-canvas p-1">
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-3 px-sm py-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="mt-2 h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
