import { useEffect, useState } from 'react';
import { formatPercent } from '@/utils/format';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface RepaymentRingProps {
  ratio: number; // 0..1
  size?: number;
}

/**
 * A circular repayment-progress indicator, drawn in on mount (an
 * SVG stroke-dashoffset animation is real, no-overshoot motion the same
 * way TrendChart's draw-in is) rather than appearing instantly at its
 * final value. Falls back to a plain opacity cross-fade under
 * prefers-reduced-motion, consistent with the other charts in the app.
 */
export function RepaymentRing({ ratio, size = 128 }: RepaymentRingProps) {
  const clamped = Math.min(1, Math.max(0, ratio));
  const reducedMotion = usePrefersReducedMotion();
  const [drawn, setDrawn] = useState(reducedMotion);
  const [visible, setVisible] = useState(!reducedMotion);

  const strokeWidth = 10;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - clamped);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(false);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setDrawn(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(raf);
  }, [clamped, reducedMotion]);

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={reducedMotion ? { opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' } : undefined}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${formatPercent(clamped)} repaid`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#eef0f3"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0052ff"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={reducedMotion ? targetOffset : drawn ? targetOffset : circumference}
          style={{
            transition: reducedMotion ? 'none' : 'stroke-dashoffset 800ms ease-out',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-xl font-semibold tabular-nums text-ink">{formatPercent(clamped)}</span>
        <span className="text-[11px] text-muted">repaid</span>
      </div>
    </div>
  );
}
