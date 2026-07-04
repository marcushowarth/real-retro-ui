import { useEffect, useState, useCallback } from 'react';
import { Dataset, DataPoint } from '../types';
import { loadDatasets, upsertDataset, removeDataset, loadPoints, savePoints } from '../storage/datasetStore';

export function useDatasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(() => {
    setDatasets(loadDatasets());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createDataset = async (dataset: Dataset): Promise<Dataset> => {
    const created = upsertDataset(dataset);
    fetchAll();
    return created;
  };

  const deleteDataset = async (id: string) => {
    removeDataset(id);
    fetchAll();
  };

  const getPoints = async (id: string): Promise<DataPoint[]> => {
    return loadPoints(id);
  };

  const replacePoints = async (id: string, points: DataPoint[]) => {
    savePoints(id, points);
  };

  return { datasets, loading, createDataset, deleteDataset, getPoints, replacePoints, refresh: fetchAll };
}
