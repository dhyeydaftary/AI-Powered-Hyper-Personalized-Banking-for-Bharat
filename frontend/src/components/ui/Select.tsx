import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
  className?: string;
}

export function Select({ value, onValueChange, options, ariaLabel, className }: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        aria-label={ariaLabel}
        className={cn(
          'inline-flex h-11 items-center justify-between gap-2 rounded-md border border-hairline bg-canvas px-base text-sm text-ink',
          'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          className
        )}
      >
        <RadixSelect.Value />
        <RadixSelect.Icon>
          <ChevronDown size={16} className="text-muted" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className="z-50 overflow-hidden rounded-md border border-hairline bg-canvas shadow-soft"
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-sm px-sm py-2 text-sm text-ink outline-none data-[highlighted]:bg-surface-soft"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check size={14} className="text-primary" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
