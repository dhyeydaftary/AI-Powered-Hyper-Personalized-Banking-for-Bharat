import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPercent } from '@/utils/format';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface SavingsRateChartProps {
  data: { month: string; label: string; value: number }[];
  datasetKey?: string;
}

/**
 * Month-by-month savings rate — the real trend behind the Overview card's
 * two-endpoint "18% → 14%" style summary. Shares TrendChart's motion
 * treatment: draws in on mount, redraws on dataset change, and falls back
 * to a plain cross-fade under prefers-reduced-motion.
 */
export function SavingsRateChart({ data, datasetKey }: SavingsRateChartProps) {
  const reducedMotion = usePrefersReducedMotion();
  const fadeKey = datasetKey ?? data.map((d) => d.month).join(',');
  const [visible, setVisible] = useState(!reducedMotion);

  useEffect(() => {
    if (!reducedMotion) return;
    setVisible(false);
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, fadeKey]);

  return (
    <div
      className="h-56 w-full"
      style={reducedMotion ? { opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' } : undefined}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart key={datasetKey} data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0052ff" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#0052ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#eef0f3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#7c828a', fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fill: '#7c828a', fontSize: 12 }}
            tickFormatter={(value: number) => `${Math.round(value * 100)}%`}
          />
          <Tooltip
            formatter={(value: number) => [formatPercent(value, 1), 'Savings rate']}
            contentStyle={{ borderRadius: 8, borderColor: '#dee1e6', fontSize: 13 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#0052ff"
            strokeWidth={2}
            fill="url(#savingsFill)"
            isAnimationActive={!reducedMotion}
            animationDuration={reducedMotion ? 0 : 650}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
