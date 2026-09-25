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
  // 'rpi'/'cpi' are the modern ONS-only series (1987/88-present) — the default view.
  // 'rpi-millennium'/'cpi-millennium' splice the same series back to 1209 via the Bank of
  // England's Millennium dataset (kanban #1003); identical values for 1987/88-present, so
  // switching to them only ever extends the range, never changes an existing value. Both
  // pairs are fetched up front so toggling "include historical" is instant, not a fetch.
  const { indexMap: rpiModernMap, latestYear, loading: rpiLoading, error: rpiError } = useIndexSeries('rpi');
  const { indexMap: cpiModernMap, loading: cpiLoading, error: cpiError } = useIndexSeries('cpi');
  const { indexMap: rpiMillenniumMap } = useIndexSeries('rpi-millennium');
  const { indexMap: cpiMillenniumMap } = useIndexSeries('cpi-millennium');
  const { datasets, createDataset, deleteDataset, getPoints, replacePoints } = useDatasets();

  const [mode, setMode] = useState<'spot' | 'datasets' | 'about'>('spot');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [points, setPoints] = useState<DataPoint[]>([]);
  const [referenceYear, setReferenceYear] = useState<number>(new Date().getFullYear());
  // Spot value's own year pickers — lifted up (rather than local state in SpotValue) so the
  // same confirm-on-uncheck flow below can cover them too (kanban #1013 follow-up).
  const [spotInputYear, setSpotInputYear] = useState<number>(new Date().getFullYear());
  const [spotTargetYear, setSpotTargetYear] = useState<number>(new Date().getFullYear());
  const [adjustedPoints, setAdjustedPoints] = useState<AdjustedPoint[]>([]);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [showNewDatasetWizard, setShowNewDatasetWizard] = useState(false);

  // Off by default — the 1209-present splice is neat but its 800-year range swamps the
  // slider and squashes the chart for the common case of comparing recent years (kanban
  // #1013). Checked, it swaps in the millennium-spliced maps everywhere; unchecked reverts
  // to the modern-only ones, unaffected either way by the toggle itself.
  const [includeHistorical, setIncludeHistorical] = useState(false);
  const [pendingUncheck, setPendingUncheck] = useState(false);

  const rpiMap = includeHistorical ? rpiMillenniumMap : rpiModernMap;
  const cpiMap = includeHistorical ? cpiMillenniumMap : cpiModernMap;
  const modernMinYear = rpiModernMap.size > 0 ? Math.min(...rpiModernMap.keys()) : 1987;
  const minYear = rpiMap.size > 0 ? Math.min(...rpiMap.keys()) : 1987;

  // Backstop clamp for all three year pickers: the explicit confirm-on-uncheck flow below
  // already resets whichever one(s) the active tab cares about, but this catches any stale
  // pre-1987 year left over from a previous historical session on the other tab.
  useEffect(() => {
    const clamp = (y: number) => Math.min(Math.max(y, minYear), latestYear || y);
    setReferenceYear(clamp);
    setSpotInputYear(clamp);
    setSpotTargetYear(clamp);
  }, [minYear, latestYear]);

  const handleHistoricalToggle = (checked: boolean) => {
    if (checked) { setIncludeHistorical(true); return; }
    const stale = mode === 'datasets'
      ? referenceYear < modernMinYear
      : spotInputYear < modernMinYear || spotTargetYear < modernMinYear;
    if (stale) { setPendingUncheck(true); return; }
    setIncludeHistorical(false);
  };

  const confirmUncheck = () => {
    setIncludeHistorical(false);
    if (mode === 'datasets') {
      setReferenceYear(y => Math.max(y, modernMinYear));
    } else {
      setSpotInputYear(y => Math.max(y, modernMinYear));
      setSpotTargetYear(y => Math.max(y, modernMinYear));
    }
    setPendingUncheck(false);
  };

  // Set default years once RPI data is loaded
  useEffect(() => {
    if (!latestYear) return;
    setReferenceYear(latestYear);
    setSpotInputYear(latestYear);
    setSpotTargetYear(latestYear);
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

  if (rpiLoading) return <p>Loading RPI data...</p>;
  if (rpiError) return <p>Error loading RPI data: {rpiError}</p>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '0.15rem' }}>REAL RETRO</h1>
      <p style={{ margin: '0 0 1rem', color: '#e2674a', fontSize: '1.1rem', fontWeight: 600 }}>
        Real Terms Visualiser
      </p>
      <p style={{ color: '#555' }}>
        Compare income or cost data across time, adjusted for inflation — ONS RPI/CPI from {modernMinYear}.
      </p>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#555', fontSize: '0.9rem' }}>
        <input
          type="checkbox"
          checked={includeHistorical}
          onChange={e => handleHistoricalToggle(e.target.checked)}
        />
        Include RPI/CPI spliced back to 1209 via BoE Millennium dataset
      </label>

      {pendingUncheck && (
        <dialog
          open
          style={{ border: 'none', borderRadius: 8, padding: '1.5rem', width: 'min(420px, 90vw)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
        >
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Switch to modern data only?</h2>
          <p style={{ color: '#555', fontSize: '0.9rem' }}>
            {mode === 'datasets'
              ? <>Your target year ({referenceYear}) is before {modernMinYear}, where the modern
                  ONS series starts. Turning off historical data will move it to {modernMinYear}.</>
              : <>One of your years (from {spotInputYear}, to {spotTargetYear}) is before{' '}
                  {modernMinYear}, where the modern ONS series starts. Turning off historical
                  data will move it to {modernMinYear}.</>}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button onClick={() => setPendingUncheck(false)}>Cancel</button>
            <button onClick={confirmUncheck}>Continue</button>
          </div>
        </dialog>
      )}

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
          inputYear={spotInputYear}
          onInputYearChange={setSpotInputYear}
          targetYear={spotTargetYear}
          onTargetYearChange={setSpotTargetYear}
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
