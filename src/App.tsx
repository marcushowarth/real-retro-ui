import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRpi } from './hooks/useRpi';
import { useDatasets } from './hooks/useDatasets';
import { adjustPoints } from './utils/inflation';
import { ReferenceYearSlider } from './components/ReferenceYearSlider';
import { InflationChart } from './components/InflationChart';
import { CsvImport } from './components/CsvImport';
import { CsvExport } from './components/CsvExport';
import { AppFooter } from './components/AppFooter';
import { Dataset, DataPoint, AdjustedPoint } from './types';

export default function App() {
  const { rpiMap, latestYear, loading: rpiLoading, error: rpiError } = useRpi();
  const { datasets, createDataset, deleteDataset, getPoints, replacePoints } = useDatasets();

  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [points, setPoints] = useState<DataPoint[]>([]);
  const [referenceYear, setReferenceYear] = useState<number>(new Date().getFullYear());
  const [adjustedPoints, setAdjustedPoints] = useState<AdjustedPoint[]>([]);

  // Set default reference year once RPI data is loaded
  useEffect(() => {
    if (latestYear) setReferenceYear(latestYear);
  }, [latestYear]);

  // Load points when dataset selection changes
  useEffect(() => {
    if (!selectedDatasetId) { setPoints([]); return; }
    getPoints(selectedDatasetId).then(setPoints);
  }, [selectedDatasetId]);

  // Recalculate adjusted points whenever points or reference year changes
  useEffect(() => {
    setAdjustedPoints(adjustPoints(points, referenceYear, rpiMap));
  }, [points, referenceYear, rpiMap]);

  const handleNewDataset = async () => {
    const name = window.prompt('Dataset name:');
    if (!name) return;
    const id = uuidv4();
    await createDataset({ id, name });
    setSelectedDatasetId(id);
  };

  const handleImport = async (imported: DataPoint[]) => {
    if (!selectedDatasetId) return;
    await replacePoints(selectedDatasetId, imported);
    setPoints(imported);
  };

  const minYear = rpiMap.size > 0 ? Math.min(...rpiMap.keys()) : 1987;

  if (rpiLoading) return <p>Loading RPI data...</p>;
  if (rpiError) return <p>Error loading RPI data: {rpiError}</p>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <h1>Real Income Visualiser</h1>
      <p style={{ color: '#555' }}>
        Compare income or cost data across time, adjusted for inflation (ONS RPI CHAW series).
      </p>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <select
          value={selectedDatasetId ?? ''}
          onChange={e => setSelectedDatasetId(e.target.value || null)}
        >
          <option value="">-- select a dataset --</option>
          {datasets.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <button onClick={handleNewDataset}>New dataset</button>
        {selectedDatasetId && (
          <button onClick={() => { deleteDataset(selectedDatasetId); setSelectedDatasetId(null); }}>
            Delete dataset
          </button>
        )}
      </div>

      {selectedDatasetId && (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <CsvImport datasetId={selectedDatasetId} onImport={handleImport} />
            <CsvExport
              datasetName={datasets.find(d => d.id === selectedDatasetId)?.name ?? 'dataset'}
              points={points}
            />
          </div>

          <ReferenceYearSlider
            minYear={minYear}
            maxYear={latestYear}
            value={referenceYear}
            onChange={setReferenceYear}
          />

          {adjustedPoints.length > 0
            ? <InflationChart points={adjustedPoints} referenceYear={referenceYear} />
            : <p>No data yet — import a CSV or add points manually.</p>
          }
        </>
      )}

      <AppFooter />
    </div>
  );
}
