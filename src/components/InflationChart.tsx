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

const pillStyle = (active: boolean, colour: string): React.CSSProperties => ({
  padding: '0.3rem 0.9rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  border: `1.5px solid ${active ? colour : '#d5d5d5'}`,
  background: active ? colour : '#fff',
  color: active ? '#fff' : '#888',
  cursor: 'pointer'
});

// One colour per data series (identity); RPI/CPI within a series is a
// second, colour-independent encoding (solid vs dashed) rather than a
// second hue, so two series' worth of lines don't fight over the palette
// (kanban #981). Decluttering is a global RPI/CPI pair of switches, not a
// per-line legend toggle — simpler mental model when there are several
// series, each already doubled into two lines.
export function InflationChart({ points, referenceYear, height = 400 }: Props) {
  const seriesNames = [...new Set(points.map(p => p.seriesName))];
  const years = [...new Set(points.map(p => new Date(p.date).getFullYear()))].sort();

  const [showRpi, setShowRpi] = useState(true);
  const [showCpi, setShowCpi] = useState(true);

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

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#777' }}>Show:</span>
        <div style={{ display: 'inline-flex', borderRadius: 999, overflow: 'hidden' }}>
          <button style={{ ...pillStyle(showRpi, '#2563eb'), borderRadius: '999px 0 0 999px', borderRight: 'none' }}
            onClick={() => setShowRpi(v => !v)}>
            RPI
          </button>
          <button style={{ ...pillStyle(showCpi, '#dc2626'), borderRadius: '0 999px 999px 0' }}
            onClick={() => setShowCpi(v => !v)}>
            CPI
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={v => formatCurrency(v as number)} width={90} />
          <Tooltip
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
            labelFormatter={year => `Year: ${year} (${referenceYear} money)`}
          />
          <Legend />
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
                hide={!showRpi}
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
                hide={!showCpi}
              />
            ];
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
