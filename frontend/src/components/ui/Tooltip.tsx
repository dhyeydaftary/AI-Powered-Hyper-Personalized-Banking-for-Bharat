import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <RadixTooltip.Provider delayDuration={200}>{children}</RadixTooltip.Provider>;
}

export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className="z-50 max-w-xs rounded-sm bg-surface-dark px-sm py-1.5 text-xs text-white shadow-soft"
          sideOffset={6}
        >
          {content}
          <RadixTooltip.Arrow className="fill-surface-dark" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
