import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AdjustedPoint } from '../types';
import { formatCurrency } from '../utils/inflation';

interface Props {
  points: AdjustedPoint[];
  referenceYear: number;
}

const DEFAULT_COLOURS = [
  '#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed',
  '#0891b2', '#be185d', '#65a30d'
];

export function InflationChart({ points, referenceYear }: Props) {
  // Group by series, build chart data keyed by year
  const seriesNames = [...new Set(points.map(p => p.seriesName))];
  const years = [...new Set(points.map(p => new Date(p.date).getFullYear()))].sort();

  const chartData = years.map(year => {
    const row: Record<string, number | string> = { year };
    seriesNames.forEach(name => {
      const match = points.find(
        p => p.seriesName === name && new Date(p.date).getFullYear() === year
      );
      if (match) row[name] = Math.round(match.adjustedAmount);
    });
    return row;
  });

  const formatTooltip = (value: number, name: string) => [formatCurrency(value), name];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis tickFormatter={v => formatCurrency(v as number)} width={90} />
        <Tooltip
          formatter={formatTooltip}
          labelFormatter={year => `Year: ${year} (${referenceYear} money)`}
        />
        <Legend />
        {seriesNames.map((name, i) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            stroke={DEFAULT_COLOURS[i % DEFAULT_COLOURS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
