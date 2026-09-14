import { LOAN_PRESETS, type LoanPreset } from '@/utils/loanPresets';
import { cn } from '@/utils/cn';

interface LoanPresetPickerProps {
  selectedId: string | null;
  onSelect: (preset: LoanPreset) => void;
}

/**
 * Illustrative starting points for rate + tenure — not real product offers.
 * Principal is intentionally absent here; it's a free input elsewhere on
 * the page since it's the one number the customer actually knows.
 */
export function LoanPresetPicker({ selectedId, onSelect }: LoanPresetPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted">
        Typical starting points for rate &amp; tenure — not real offers, adjust as needed
      </span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {LOAN_PRESETS.map((preset) => {
          const selected = preset.id === selectedId;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              aria-pressed={selected}
              className={cn(
                'flex flex-col gap-0.5 rounded-lg border p-sm text-left transition-colors',
                selected
                  ? 'border-primary/30 bg-primary-soft/40'
                  : 'border-hairline bg-canvas hover:bg-surface-soft'
              )}
            >
              <span className="text-sm font-medium text-ink">{preset.label}</span>
              <span className="text-xs text-muted">
                {preset.rateLabel} &middot; {preset.tenureLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
