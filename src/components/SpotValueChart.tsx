import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceDot, ResponsiveContainer
} from 'recharts';
import { adjust, formatCurrency } from '../utils/inflation';

interface Props {
  amount: number;
  inputYear: number;
  rpiMap: Map<number, number>;
  cpiMap: Map<number, number>;
}

export function SpotValueChart({ amount, inputYear, rpiMap, cpiMap }: Props) {
  // RPI is the driving axis (it's the longer-running series, CHAW starts
  // 1987 vs CPI/D7BT's 1988) — a year with no CPI reading just omits that
  // point rather than dropping the RPI one too.
  const years = [...rpiMap.keys()].sort((a, b) => a - b);
  const chartData = years.map(year => ({
    year,
    rpiValue: Math.round(adjust(amount, inputYear, year, rpiMap)),
    cpiValue: cpiMap.has(year) ? Math.round(adjust(amount, inputYear, year, cpiMap)) : undefined
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis tickFormatter={v => formatCurrency(v as number)} width={90} />
        <Tooltip
          formatter={(value: number, name: string) => [formatCurrency(value), name]}
          labelFormatter={year => `Year: ${year}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="rpiValue"
          name="RPI-adjusted"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 3 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="cpiValue"
          name="CPI-adjusted"
          stroke="#dc2626"
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls={true}
          isAnimationActive={false}
        />
        <ReferenceDot x={inputYear} y={Math.round(amount)} r={6} fill="#e2674a" stroke="none" />
      </LineChart>
    </ResponsiveContainer>
  );
}
