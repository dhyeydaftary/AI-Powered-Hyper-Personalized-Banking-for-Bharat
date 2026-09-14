import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { CategoryTotal } from '@/utils/analytics';
import { formatCategory, formatCurrency } from '@/utils/format';

const BAR_COLOR = '#0052ff';

/** "Where did my money go?" — spending by category (Section 58). */
export function CategoryBreakdown({ data }: { data: CategoryTotal[] }) {
  const chartData = data.map((entry) => ({ name: formatCategory(entry.category), total: entry.total }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="#eef0f3" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#7c828a', fontSize: 12 }}
            tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            width={88}
            tick={{ fill: '#0a0b0d', fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Spent']}
            contentStyle={{ borderRadius: 8, borderColor: '#dee1e6', fontSize: 13 }}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={BAR_COLOR} fillOpacity={1 - i * 0.1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
