import React, { useRef } from 'react';
import { DataPoint } from '../types';

interface Props {
  datasetId: string;
  onImport: (points: DataPoint[]) => void;
}

/**
 * Expects CSV format:
 *   date,SeriesA,SeriesB,...
 *   2000-01-01,25000,,
 *   2005-01-01,32000,28000
 *
 * Blank cells = no data point for that series on that date.
 */
export function CsvImport({ datasetId, onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim());
      const seriesNames = headers.slice(1); // first col is date

      const points: DataPoint[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        const date = cols[0]?.trim();
        if (!date) continue;
        seriesNames.forEach((name, idx) => {
          const raw = cols[idx + 1]?.trim();
          if (!raw) return;
          const amount = parseFloat(raw);
          if (!isNaN(amount)) {
            points.push({ datasetId, seriesName: name, date, amount });
          }
        });
      }
      onImport(points);
      if (inputRef.current) inputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <label htmlFor="csv-upload">Import CSV: </label>
      <input
        id="csv-upload"
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFile}
      />
    </div>
  );
}
