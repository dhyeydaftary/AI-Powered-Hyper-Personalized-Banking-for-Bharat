import * as RadixProgress from '@radix-ui/react-progress';
import { cn } from '@/utils/cn';

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  label?: string;
}

export function Progress({ value, className, label }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <RadixProgress.Root
      value={clamped}
      aria-label={label}
      className={cn('h-2 w-full overflow-hidden rounded-pill bg-surface-strong', className)}
    >
      <RadixProgress.Indicator
        className="h-full rounded-pill bg-primary transition-transform duration-300"
        style={{ transform: `translateX(-${100 - clamped}%)` }}
      />
    </RadixProgress.Root>
  );
}
