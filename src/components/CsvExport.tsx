import React from 'react';
import { DataPoint } from '../types';

interface Props {
  datasetName: string;
  points: DataPoint[];
}

export function CsvExport({ datasetName, points }: Props) {
  const handleExport = () => {
    const seriesNames = [...new Set(points.map(p => p.seriesName))].sort();
    const dates = [...new Set(points.map(p => p.date))].sort();

    const header = ['date', ...seriesNames].join(',');
    const rows = dates.map(date => {
      const cols = seriesNames.map(name => {
        const match = points.find(p => p.date === date && p.seriesName === name);
        return match ? String(match.amount) : '';
      });
      return [date, ...cols].join(',');
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${datasetName.replace(/\s+/g, '-').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleExport} disabled={points.length === 0}>
      Export CSV
    </button>
  );
}
