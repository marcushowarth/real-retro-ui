import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AdjustedPoint } from '../types';
import { formatCurrency } from '../utils/inflation';

interface Props {
  points: AdjustedPoint[];
  referenceYear: number;
  height?: number;
}

const DEFAULT_COLOURS = [
  '#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed',
  '#0891b2', '#be185d', '#65a30d'
];

// One colour per data series (identity); RPI/CPI within a series is a
// second, colour-independent encoding (solid vs dashed) rather than a
// second hue, so two series' worth of lines don't fight over the palette
// (kanban #981 — this is the InflationChart analogue of SpotValueChart's
// two-line, both-visible-by-default shape).
export function InflationChart({ points, referenceYear, height = 400 }: Props) {
  const seriesNames = [...new Set(points.map(p => p.seriesName))];
  const years = [...new Set(points.map(p => new Date(p.date).getFullYear()))].sort();

  // Legend-driven visibility, keyed by dataKey. Empty = everything shown —
  // both indexes default on; a noisy view is opt-out, not opt-in.
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  const rpiKey = (name: string) => `${name}__rpi`;
  const cpiKey = (name: string) => `${name}__cpi`;

  const chartData = years.map(year => {
    const row: Record<string, number | string> = { year };
    seriesNames.forEach(name => {
      const match = points.find(
        p => p.seriesName === name && new Date(p.date).getFullYear() === year
      );
      if (match) {
        row[rpiKey(name)] = Math.round(match.adjustedAmount);
        row[cpiKey(name)] = Math.round(match.adjustedAmountCpi);
      }
    });
    return row;
  });

  const toggleKey = (dataKey: string) => {
    setHiddenKeys(prev => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey); else next.add(dataKey);
      return next;
    });
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis tickFormatter={v => formatCurrency(v as number)} width={90} />
        <Tooltip
          formatter={(value: number, name: string) => [formatCurrency(value), name]}
          labelFormatter={year => `Year: ${year} (${referenceYear} money)`}
        />
        <Legend
          onClick={(entry: any) => toggleKey(entry.dataKey)}
          formatter={(value: string, entry: any) => (
            <span style={{
              cursor: 'pointer',
              opacity: hiddenKeys.has(entry.dataKey) ? 0.4 : 1,
              textDecoration: hiddenKeys.has(entry.dataKey) ? 'line-through' : 'none'
            }}>
              {value}
            </span>
          )}
        />
        {seriesNames.flatMap((name, i) => {
          const colour = DEFAULT_COLOURS[i % DEFAULT_COLOURS.length];
          return [
            <Line
              key={rpiKey(name)}
              type="monotone"
              dataKey={rpiKey(name)}
              name={`${name} (RPI)`}
              stroke={colour}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls={true}
              hide={hiddenKeys.has(rpiKey(name))}
            />,
            <Line
              key={cpiKey(name)}
              type="monotone"
              dataKey={cpiKey(name)}
              name={`${name} (CPI)`}
              stroke={colour}
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 4 }}
              connectNulls={true}
              hide={hiddenKeys.has(cpiKey(name))}
            />
          ];
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
