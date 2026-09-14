import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { getConfidenceLabel, getConfidenceLevel, getConfidenceDescription } from '@/utils/confidence';

const toneByLevel = { low: 'neutral', moderate: 'attention', high: 'positive' } as const;

export function ConfidenceBadge({ confidence, historyMonths }: { confidence: number; historyMonths: number }) {
  const level = getConfidenceLevel(confidence);
  const description = getConfidenceDescription(confidence, historyMonths);

  return (
    <Tooltip content={description}>
      <span tabIndex={0}>
        <Badge tone={toneByLevel[level]}>{getConfidenceLabel(confidence)} confidence</Badge>
      </span>
    </Tooltip>
  );
}
