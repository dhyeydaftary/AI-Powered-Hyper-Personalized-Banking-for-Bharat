import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MonthlyTotals } from '@/utils/analytics';
import { formatCurrency } from '@/utils/format';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface TrendChartProps {
  data: MonthlyTotals[];
  /** Identifies which dataset this is (e.g. the current demo customer id).
   * When it changes, the chart treats the new data as a fresh dataset and
   * draws in again, rather than trying to tween between two series that
   * may not even share the same months — the more reliable way to keep
   * "switching between C1001 and C1002" feeling animated instead of a
   * silent, unreliable point-by-point interpolation. */
  datasetKey?: string;
}

/**
 * Income vs. expense trend — only rendered when there are enough distinct
 * months to show a real trend (Section 57). A single data point would be
 * misleadingly smooth, so callers should show a plain comparison instead.
 *
 * Motion (apple-design fix): draws the line/area in on first render and
 * redraws on dataset change, using a no-overshoot ("ease-out") timing —
 * recharts only exposes named easing curves, not literal spring physics,
 * so this is the closest built-in equivalent to a critically-damped
 * spring (no bounce), reserved for this data visualization rather than
 * any gesture-driven interaction. `prefers-reduced-motion` disables the
 * draw-in entirely and falls back to a plain opacity cross-fade instead.
 */
export function TrendChart({ data, datasetKey }: TrendChartProps) {
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
      className="h-64 w-full"
      style={reducedMotion ? { opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' } : undefined}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart key={datasetKey} data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0052ff" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#0052ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cf202f" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#cf202f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#eef0f3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#7c828a', fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: '#7c828a', fontSize: 12 }}
            tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [formatCurrency(value), name === 'income' ? 'Income' : 'Expense']}
            contentStyle={{ borderRadius: 8, borderColor: '#dee1e6', fontSize: 13 }}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#0052ff"
            strokeWidth={2}
            fill="url(#incomeFill)"
            isAnimationActive={!reducedMotion}
            animationDuration={reducedMotion ? 0 : 650}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#cf202f"
            strokeWidth={2}
            fill="url(#expenseFill)"
            isAnimationActive={!reducedMotion}
            animationDuration={reducedMotion ? 0 : 650}
            animationBegin={reducedMotion ? 0 : 80}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
