import React from 'react';
import { InflationChart } from './InflationChart';
import { adjustPoints } from '../utils/inflation';
import { EXAMPLE_CSV, buildExamplePoints } from '../data/exampleDataset';

interface Props {
  rpiMap: Map<number, number>;
  latestYear: number;
  cpiMap: Map<number, number>;
  onLoadExample: () => void;
}

const tierBox: React.CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: 6,
  padding: '0.6rem 0.9rem',
  background: '#fff',
  fontSize: '0.85rem',
  textAlign: 'center',
  flex: 1,
};

/**
 * Persistent explainer above the dataset picker — shows the Dataset > Series
 * > Data point hierarchy using a real worked example (motorbikes), with the
 * literal CSV format alongside the chart it produces. Doubles as the CSV
 * format documentation, which previously only existed as a code comment in
 * CsvImport.tsx. See Kanban #978.
 */
export function DatasetGuide({ rpiMap, latestYear, cpiMap, onLoadExample }: Props) {
  const previewPoints = adjustPoints(buildExamplePoints('preview'), latestYear, rpiMap, cpiMap);

  return (
    <div
      style={{
        border: '1px solid #f0c4b8',
        borderRadius: 8,
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        background: '#fff8f6',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>How datasets work</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={tierBox}>
          <strong>Dataset</strong>
          <br />
          e.g. &ldquo;Motorbikes&rdquo;
        </div>
        <span style={{ color: '#c9a99f', fontSize: '1.2rem' }}>&rarr;</span>
        <div style={tierBox}>
          <strong>Series</strong>
          <br />
          e.g. &ldquo;Honda CBR600RR&rdquo;
        </div>
        <span style={{ color: '#c9a99f', fontSize: '1.2rem' }}>&rarr;</span>
        <div style={tierBox}>
          <strong>Data points</strong>
          <br />
          date + amount pairs
        </div>
      </div>

      <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1rem' }}>
        A <strong>dataset</strong> is a group of <strong>series</strong> you want to compare — e.g. three
        different bikes. Each series is just a list of prices at points in time. Import a CSV with one
        column per series, or add points by hand afterwards.
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 260px', minWidth: 260 }}>
          <p style={{ fontSize: '0.8rem', color: '#777', marginBottom: '0.3rem' }}>
            CSV format — one column per series, blank means no data point that date:
          </p>
          <pre
            style={{
              background: '#f4f3ec',
              padding: '0.6rem',
              borderRadius: 4,
              fontSize: '0.72rem',
              overflowX: 'auto',
              margin: 0,
            }}
          >
            {EXAMPLE_CSV}
          </pre>
        </div>
        <div style={{ flex: '1 1 320px', minWidth: 280 }}>
          <p style={{ fontSize: '0.8rem', color: '#777', marginBottom: '0.3rem' }}>
            What that looks like, adjusted for inflation:
          </p>
          <InflationChart points={previewPoints} referenceYear={latestYear} height={200} />
        </div>
      </div>

      <button onClick={onLoadExample} style={{ marginTop: '1rem' }}>
        Load this example dataset
      </button>
    </div>
  );
}
