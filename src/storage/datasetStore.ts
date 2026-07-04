import { Dataset, DataPoint } from '../types';

/**
 * Client-side dataset persistence — localStorage only, no backend.
 * See kanban #874 comment #1586: real-retro-api is stateless, datasets and
 * their points live entirely in the browser (same pattern as fin-optics-ui).
 */
const DATASETS_KEY = 'real-retro:datasets';
const pointsKey = (datasetId: string) => `real-retro:points:${datasetId}`;

export function loadDatasets(): Dataset[] {
  const raw = localStorage.getItem(DATASETS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveDatasets(datasets: Dataset[]): void {
  localStorage.setItem(DATASETS_KEY, JSON.stringify(datasets));
}

export function upsertDataset(dataset: Dataset): Dataset {
  const datasets = loadDatasets();
  const now = new Date().toISOString();
  const existing = datasets.find(d => d.id === dataset.id);
  const saved: Dataset = {
    ...dataset,
    createdAt: existing?.createdAt ?? dataset.createdAt ?? now,
    updatedAt: now
  };
  const next = existing
    ? datasets.map(d => (d.id === saved.id ? saved : d))
    : [...datasets, saved];
  saveDatasets(next);
  return saved;
}

export function removeDataset(id: string): void {
  saveDatasets(loadDatasets().filter(d => d.id !== id));
  localStorage.removeItem(pointsKey(id));
}

export function loadPoints(datasetId: string): DataPoint[] {
  const raw = localStorage.getItem(pointsKey(datasetId));
  return raw ? JSON.parse(raw) : [];
}

export function savePoints(datasetId: string, points: DataPoint[]): void {
  localStorage.setItem(pointsKey(datasetId), JSON.stringify(points));
  const datasets = loadDatasets();
  const dataset = datasets.find(d => d.id === datasetId);
  if (dataset) upsertDataset(dataset);
}
