import { cn } from '@/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-sm bg-surface-strong', className)} />;
}

/** A short, specific loading message, e.g. "Loading your transactions…" (Section 42). */
export function LoadingState({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 py-lg text-sm text-muted', className)} role="status" aria-live="polite">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-hairline border-t-primary" aria-hidden />
      {message}
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-hairline bg-canvas p-base">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-32" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  );
}
