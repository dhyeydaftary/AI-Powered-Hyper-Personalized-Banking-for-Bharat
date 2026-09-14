import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface MiniTrendPoint {
  label: string;
  value: number;
  /** Marks the single point this trend is being shown to explain — e.g.
   * the anomalous transaction in a recent-activity timeline. */
  highlight?: boolean;
}

interface MiniTrendChartProps {
  data: MiniTrendPoint[];
  valueFormatter?: (value: number) => string;
  color?: string;
  highlightColor?: string;
}

/**
 * A small, real trend line for decision-detail views — used where the
 * backend signal is genuinely a trend (e.g. month-by-month savings rate,
 * or a timeline of recent transaction amounts) so the customer sees more
 * than two bare endpoint numbers. Draws in on mount and respects
 * prefers-reduced-motion (falls back to no animation, not a spring).
 */
export function MiniTrendChart({
  data,
  valueFormatter = (v) => String(v),
  color = '#0052ff',
  highlightColor = '#cf202f',
}: MiniTrendChartProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, left: 12, bottom: 0 }}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#7c828a', fontSize: 11 }} />
          <Tooltip
            formatter={(value: number) => [valueFormatter(value), '']}
            labelFormatter={() => ''}
            contentStyle={{ borderRadius: 8, borderColor: '#dee1e6', fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            isAnimationActive={!reducedMotion}
            animationDuration={reducedMotion ? 0 : 600}
            animationEasing="ease-out"
            dot={(props: { cx?: number; cy?: number; index?: number }) => {
              const point = typeof props.index === 'number' ? data[props.index] : undefined;
              return (
                <circle
                  key={`dot-${props.index}`}
                  cx={props.cx}
                  cy={props.cy}
                  r={point?.highlight ? 5 : 3}
                  fill={point?.highlight ? highlightColor : color}
                  stroke="white"
                  strokeWidth={point?.highlight ? 2 : 0}
                />
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
