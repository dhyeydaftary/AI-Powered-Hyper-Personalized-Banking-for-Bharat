import { Languages } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

/**
 * A self-contained, honest preview of what turning "Responses in your
 * language" off actually means — without touching the real language
 * selector or Copilot (out of scope for this pass). This never claims to
 * be wired into those surfaces; it only shows, on this page, what language
 * availability would look like under the current setting, so the toggle
 * still has a real, observable effect somewhere rather than visibly doing
 * nothing.
 */
export function LanguageAvailabilityPreview({ enabled }: { enabled: boolean }) {
  return (
    <div className="flex flex-col gap-2 rounded-md bg-surface-soft p-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-muted">
        <Languages size={14} aria-hidden /> Language availability preview
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">English</Badge>
        <Badge tone={enabled ? 'positive' : 'neutral'} className={cn(!enabled && 'opacity-50')}>
          Hindi{!enabled ? ' — unavailable' : ''}
        </Badge>
      </div>
      <p className="text-xs text-muted-soft">
        A preview of the language options this setting would allow — it doesn&apos;t yet change the language
        selector or Copilot elsewhere in the app.
      </p>
    </div>
  );
}
