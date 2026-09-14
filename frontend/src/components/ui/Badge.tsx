import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type BadgeTone = 'neutral' | 'positive' | 'attention' | 'critical' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-surface-strong text-ink',
  positive: 'bg-up-soft text-up',
  attention: 'bg-warn-soft text-warn',
  critical: 'bg-down-soft text-down',
  info: 'bg-info-soft text-info',
};

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-sm py-1 text-xs font-semibold',
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
