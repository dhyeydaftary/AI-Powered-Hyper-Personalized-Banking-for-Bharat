import { AlertCircle, WifiOff } from 'lucide-react';
import { Button } from './Button';
import { ApiClientError } from '@/api/client';

interface ErrorStateProps {
  title: string;
  error?: unknown;
  onRetry?: () => void;
}

/**
 * Human-friendly error rendering. Never surfaces raw error objects/stack
 * traces (Section 43) — falls back to a generic message when the error
 * code isn't one we recognize.
 */
export function ErrorState({ title, error, onRetry }: ErrorStateProps) {
  const isNetwork = error instanceof ApiClientError && error.isNetworkError;
  const message =
    error instanceof ApiClientError && !error.isNetworkError
      ? error.message
      : 'Please check your connection and try again.';

  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-hairline bg-canvas px-base py-xl text-center">
      <span className="text-down" aria-hidden>
        {isNetwork ? <WifiOff size={24} /> : <AlertCircle size={24} />}
      </span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="max-w-sm text-sm text-muted">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          Retry
        </Button>
      )}
    </div>
  );
}
