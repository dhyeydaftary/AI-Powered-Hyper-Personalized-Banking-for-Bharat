import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children?: ReactNode;
  className?: string;
}

/**
 * A side-panel variant of Dialog, used for secondary detail views (decision
 * detail, transaction detail on larger screens) so the customer keeps
 * context with the page behind it — an Uber-style bottom-sheet pattern is
 * used instead on narrow screens via the `sm:` breakpoint below.
 */
export function Drawer({ open, onOpenChange, title, children, className }: DrawerProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-surface-dark/40 animate-fade-in" />
        <RadixDialog.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-xl bg-canvas p-lg shadow-soft',
            'focus:outline-none animate-slide-up',
            'sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:rounded-l-xl sm:animate-slide-in-right',
            className
          )}
        >
          <div className="mb-base flex items-start justify-between gap-4">
            <RadixDialog.Title className="text-lg font-semibold text-ink">{title}</RadixDialog.Title>
            <RadixDialog.Close
              className="shrink-0 rounded-sm p-1 text-muted hover:bg-surface-soft hover:text-ink"
              aria-label="Close"
            >
              <X size={18} />
            </RadixDialog.Close>
          </div>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
