import { useEffect, useState, useCallback } from 'react';
import { Dataset, DataPoint } from '../types';

export function useDatasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(() => {
    fetch('/api/datasets')
      .then(r => r.json())
      .then(setDatasets)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createDataset = async (dataset: Dataset): Promise<Dataset> => {
    const res = await fetch(`/api/datasets/${dataset.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataset)
    });
    const created = await res.json();
    fetchAll();
    return created;
  };

  const deleteDataset = async (id: string) => {
    await fetch(`/api/datasets/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const getPoints = async (id: string): Promise<DataPoint[]> => {
    return fetch(`/api/datasets/${id}/points`).then(r => r.json());
  };

  const replacePoints = async (id: string, points: DataPoint[]) => {
    await fetch(`/api/datasets/${id}/points`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(points)
    });
  };

  return { datasets, loading, createDataset, deleteDataset, getPoints, replacePoints, refresh: fetchAll };
}
