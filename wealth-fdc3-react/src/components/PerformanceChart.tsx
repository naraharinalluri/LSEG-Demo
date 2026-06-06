import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts';
import type { PerformancePoint } from '../types';

export function PerformanceChart({ data }: { data: PerformancePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 38, left: 0, bottom: 4 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal vertical={false} />
        <YAxis
          domain={['dataMin - 1', 'dataMax + 1']}
          tickFormatter={(v) => `${(v - 100).toFixed(0)}%`}
          tick={{ fontSize: 9, fill: '#8b95a7', fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
          width={38}
          orientation="right"
        />
        <Tooltip
          contentStyle={{
            background: '#1c212c',
            border: '1px solid rgba(255,255,255,0.14)',
            fontSize: 11,
            fontFamily: 'JetBrains Mono',
            padding: '4px 8px',
          }}
          labelFormatter={() => ''}
          formatter={(v) => [`${(Number(v) - 100).toFixed(2)}%`, '']}
        />
        <Area
          type="monotone"
          dataKey="portfolio"
          stroke="#8b95a7"
          strokeWidth={1.5}
          fill="rgba(139,149,167,0.15)"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="benchmark"
          stroke="#5c6473"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
