import type { ReactNode } from 'react';
import { Info, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type AlertTone = 'neutral' | 'attention' | 'critical' | 'positive';

interface AlertProps {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
  className?: string;
}

const toneStyles: Record<AlertTone, { border: string; bg: string; icon: ReactNode; iconColor: string }> = {
  neutral: { border: 'border-hairline', bg: 'bg-surface-soft', icon: <Info size={18} />, iconColor: 'text-muted' },
  attention: {
    border: 'border-warn/25',
    bg: 'bg-warn-soft',
    icon: <AlertTriangle size={18} />,
    iconColor: 'text-warn',
  },
  critical: {
    border: 'border-down/25',
    bg: 'bg-down-soft',
    icon: <ShieldAlert size={18} />,
    iconColor: 'text-down',
  },
  positive: {
    border: 'border-up/25',
    bg: 'bg-up-soft',
    icon: <CheckCircle2 size={18} />,
    iconColor: 'text-up',
  },
};

export function Alert({ tone = 'neutral', title, children, className }: AlertProps) {
  const style = toneStyles[tone];
  return (
    <div className={cn('flex gap-3 rounded-md border p-base', style.border, style.bg, className)} role="status">
      <span className={cn('mt-0.5 shrink-0', style.iconColor)} aria-hidden>
        {style.icon}
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {children && <div className="text-sm text-body">{children}</div>}
      </div>
    </div>
  );
}
