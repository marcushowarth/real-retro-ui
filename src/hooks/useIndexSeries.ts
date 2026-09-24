import { useEffect, useState } from 'react';
import { IndexEntry } from '../types';
import { buildIndexMap } from '../utils/inflation';

/**
 * Fetches one price-index series (RPI or CPI) from /api/index/{series} —
 * one hook for both, replacing the hand-copied useRpi/useCpi (kanban #1007).
 */
export function useIndexSeries(series: 'rpi' | 'cpi') {
  const [entries, setEntries] = useState<IndexEntry[]>([]);
  const [indexMap, setIndexMap] = useState<Map<number, number>>(new Map());
  const [latestYear, setLatestYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/index/${series}`).then(r => r.json()),
      fetch(`/api/index/${series}/latest-year`).then(r => r.json())
    ])
      .then(([data, latestYearData]: [IndexEntry[], { year: number }]) => {
        setEntries(data);
        setIndexMap(buildIndexMap(data));
        setLatestYear(latestYearData.year);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [series]);

  return { entries, indexMap, latestYear, loading, error };
}
