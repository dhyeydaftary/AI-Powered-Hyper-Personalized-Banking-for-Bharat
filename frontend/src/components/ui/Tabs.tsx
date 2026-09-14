import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from '@/utils/cn';

export const Tabs = RadixTabs.Root;

export function TabsList({ className, ...props }: RadixTabs.TabsListProps) {
  return (
    <RadixTabs.List
      className={cn('inline-flex items-center gap-1 rounded-pill bg-surface-strong p-1', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: RadixTabs.TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'rounded-pill px-base py-2 text-sm font-medium text-body transition-colors',
        'data-[state=active]:bg-canvas data-[state=active]:text-ink data-[state=active]:shadow-soft',
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: RadixTabs.TabsContentProps) {
  return <RadixTabs.Content className={cn('outline-none', className)} {...props} />;
}
