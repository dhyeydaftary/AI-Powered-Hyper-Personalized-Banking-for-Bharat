import type { ReactNode } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MetricProps {
  label: string;
  value: ReactNode;
  trend?: { direction: 'up' | 'down'; label: string; isGood?: boolean } | null;
  unavailableReason?: string;
  className?: string;
  /** 'lg' (default) preserves the original standalone-metric size used on
   * Money/What-if. 'sm' is for a metric shown as a secondary figure next to
   * a more dominant hero number (Overview's Financial snapshot). */
  size?: 'sm' | 'lg';
}

/**
 * A single labeled metric. Trend is only rendered when explicitly supplied —
 * never fabricate a comparison the backend didn't provide (Section 18).
 */
export function Metric({ label, value, trend, unavailableReason, className, size = 'lg' }: MetricProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      {unavailableReason ? (
        <span className="text-sm text-muted-soft">{unavailableReason}</span>
      ) : (
        <>
          <span
            className={cn(
              'font-mono font-medium tabular-nums text-ink',
              size === 'sm' ? 'text-lg' : 'text-2xl'
            )}
          >
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend.isGood === false ? 'text-down' : trend.isGood === true ? 'text-up' : 'text-muted'
              )}
            >
              {trend.direction === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {trend.label}
            </span>
          )}
        </>
      )}
    </div>
  );
}
