import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PayoffPoint } from '@/utils/loanMath';
import { formatCurrency } from '@/utils/format';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface PayoffChartProps {
  data: PayoffPoint[];
  datasetKey?: string;
}

/**
 * The estimated payoff schedule — a computed projection, not a value the
 * backend returns (callers must label it that way in surrounding copy).
 * Shares the same motion treatment as the Money page's trend charts:
 * draws in on mount, redraws on dataset change, and falls back to a
 * plain cross-fade under prefers-reduced-motion.
 */
export function PayoffChart({ data, datasetKey }: PayoffChartProps) {
  const reducedMotion = usePrefersReducedMotion();
  const fadeKey = datasetKey ?? `${data.length}-${data[0]?.balance ?? 0}`;
  const [visible, setVisible] = useState(!reducedMotion);

  useEffect(() => {
    if (!reducedMotion) return;
    setVisible(false);
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, fadeKey]);

  // Thin out X-axis labels so a 24+ month schedule doesn't crowd the axis.
  const labelEvery = Math.max(1, Math.ceil(data.length / 8));

  return (
    <div
      className="h-56 w-full"
      style={reducedMotion ? { opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' } : undefined}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart key={datasetKey} data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="payoffFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0052ff" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#0052ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#eef0f3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={labelEvery - 1}
            tick={{ fill: '#7c828a', fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: '#7c828a', fontSize: 12 }}
            tickFormatter={(value: number) => `₹${Math.round(value / 1000)}k`}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Estimated balance']}
            labelFormatter={(_, payload) => (payload?.[0]?.payload.month === 0 ? 'Now' : `Month ${payload?.[0]?.payload.month}`)}
            contentStyle={{ borderRadius: 8, borderColor: '#dee1e6', fontSize: 13 }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#0052ff"
            strokeWidth={2}
            fill="url(#payoffFill)"
            isAnimationActive={!reducedMotion}
            animationDuration={reducedMotion ? 0 : 700}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
