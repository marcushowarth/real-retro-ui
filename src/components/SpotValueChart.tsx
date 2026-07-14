import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot, ResponsiveContainer
} from 'recharts';
import { adjust, formatCurrency } from '../utils/inflation';

interface Props {
  amount: number;
  inputYear: number;
  rpiMap: Map<number, number>;
}

export function SpotValueChart({ amount, inputYear, rpiMap }: Props) {
  const years = [...rpiMap.keys()].sort((a, b) => a - b);
  const chartData = years.map(year => ({
    year,
    value: Math.round(adjust(amount, inputYear, year, rpiMap))
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis tickFormatter={v => formatCurrency(v as number)} width={90} />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Equivalent value']}
          labelFormatter={year => `Year: ${year}`}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 3 }}
          isAnimationActive={false}
        />
        <ReferenceDot x={inputYear} y={Math.round(amount)} r={6} fill="#e2674a" stroke="none" />
      </LineChart>
    </ResponsiveContainer>
  );
}
