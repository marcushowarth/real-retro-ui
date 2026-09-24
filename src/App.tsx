import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useIndexSeries } from './hooks/useIndexSeries';
import { useDatasets } from './hooks/useDatasets';
import { adjustPoints } from './utils/inflation';
import { ReferenceYearSlider } from './components/ReferenceYearSlider';
import { InflationChart } from './components/InflationChart';
import { CsvImport } from './components/CsvImport';
import { CsvExport } from './components/CsvExport';
import { ManageSeriesDialog } from './components/ManageSeriesDialog';
import { DatasetGuide } from './components/DatasetGuide';
import { NewDatasetWizard, StartMode } from './components/NewDatasetWizard';
import { SpotValue } from './components/SpotValue';
import { About } from './components/About';
import { AppFooter } from './components/AppFooter';
import { buildExamplePoints, EXAMPLE_DATASET_NAME } from './data/exampleDataset';
import { Dataset, DataPoint, AdjustedPoint } from './types';

export default function App() {
  const { indexMap: rpiMap, latestYear, loading: rpiLoading, error: rpiError } = useIndexSeries('rpi');
  const { indexMap: cpiMap, loading: cpiLoading, error: cpiError } = useIndexSeries('cpi');
  const { datasets, createDataset, deleteDataset, getPoints, replacePoints } = useDatasets();

  const [mode, setMode] = useState<'spot' | 'datasets' | 'about'>('spot');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [points, setPoints] = useState<DataPoint[]>([]);
  const [referenceYear, setReferenceYear] = useState<number>(new Date().getFullYear());
  const [adjustedPoints, setAdjustedPoints] = useState<AdjustedPoint[]>([]);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [showNewDatasetWizard, setShowNewDatasetWizard] = useState(false);

  // Set default reference year once RPI data is loaded
  useEffect(() => {
    if (latestYear) setReferenceYear(latestYear);
  }, [latestYear]);

  // Load points when dataset selection changes
  useEffect(() => {
    if (!selectedDatasetId) { setPoints([]); return; }
    getPoints(selectedDatasetId).then(setPoints);
  }, [selectedDatasetId]);

  // Recalculate adjusted points whenever points, reference year, or either index changes
  useEffect(() => {
    setAdjustedPoints(adjustPoints(points, referenceYear, rpiMap, cpiMap));
  }, [points, referenceYear, rpiMap, cpiMap]);

  const handleWizardSubmit = async (name: string, mode: StartMode) => {
    const id = uuidv4();
    await createDataset({ id, name });
    if (mode === 'example') {
      const examplePoints = buildExamplePoints(id);
      await replacePoints(id, examplePoints);
      setPoints(examplePoints);
    }
    setSelectedDatasetId(id);
    setShowNewDatasetWizard(false);
  };

  // One-click shortcut from the guide panel — skips the wizard entirely,
  // straight into a working example dataset.
  const handleLoadExample = () => handleWizardSubmit(EXAMPLE_DATASET_NAME, 'example');

  const handleImport = async (imported: DataPoint[]) => {
    if (!selectedDatasetId) return;
    await replacePoints(selectedDatasetId, imported);
    setPoints(imported);
  };

  const handleManualSave = async (updated: DataPoint[]) => {
    if (!selectedDatasetId) return;
    await replacePoints(selectedDatasetId, updated);
    setPoints(updated);
  };

  const minYear = rpiMap.size > 0 ? Math.min(...rpiMap.keys()) : 1987;

  if (rpiLoading) return <p>Loading RPI data...</p>;
  if (rpiError) return <p>Error loading RPI data: {rpiError}</p>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '0.15rem' }}>REAL RETRO</h1>
      <p style={{ margin: '0 0 1rem', color: '#e2674a', fontSize: '1.1rem', fontWeight: 600 }}>
        Real Terms Visualiser
      </p>
      <p style={{ color: '#555' }}>
        Compare income or cost data across time, adjusted for inflation (ONS RPI CHAW and CPI D7BT series).
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setMode('spot')}
          style={{ fontWeight: mode === 'spot' ? 700 : 400 }}
        >
          Spot value
        </button>
        <button
          onClick={() => setMode('datasets')}
          style={{ fontWeight: mode === 'datasets' ? 700 : 400 }}
        >
          Datasets
        </button>
        <button
          onClick={() => setMode('about')}
          style={{ fontWeight: mode === 'about' ? 700 : 400 }}
        >
          About
        </button>
      </div>

      {mode === 'about' && <About />}

      {mode === 'spot' && (
        <SpotValue
          rpiMap={rpiMap}
          latestYear={latestYear}
          cpiMap={cpiMap}
          cpiLoading={cpiLoading}
          cpiError={cpiError}
        />
      )}

      {mode === 'datasets' && (
        <>
          <DatasetGuide rpiMap={rpiMap} latestYear={latestYear} cpiMap={cpiMap} onLoadExample={handleLoadExample} />

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
            <button onClick={() => setShowNewDatasetWizard(true)}>New dataset</button>
            {selectedDatasetId && (
              <button onClick={() => { deleteDataset(selectedDatasetId); setSelectedDatasetId(null); }}>
                Delete dataset
              </button>
            )}
          </div>

          <NewDatasetWizard
            open={showNewDatasetWizard}
            onClose={() => setShowNewDatasetWizard(false)}
            onSubmit={handleWizardSubmit}
          />

          {selectedDatasetId && (
            <>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <CsvImport datasetId={selectedDatasetId} onImport={handleImport} />
                <CsvExport
                  datasetName={datasets.find(d => d.id === selectedDatasetId)?.name ?? 'dataset'}
                  points={points}
                />
                <button onClick={() => setShowManageDialog(true)}>Manage data</button>
              </div>

              {showManageDialog && (
                <ManageSeriesDialog
                  datasetId={selectedDatasetId}
                  points={points}
                  onSave={handleManualSave}
                  onClose={() => setShowManageDialog(false)}
                />
              )}

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
        </>
      )}

      <AppFooter />
    </div>
  );
}
