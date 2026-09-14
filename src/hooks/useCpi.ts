import { useEffect, useState } from 'react';
import { CpiEntry } from '../types';
import { buildRpiMap } from '../utils/inflation';

/** Mirrors useRpi — /api/cpi returns the same {year, index}[] shape as /api/rpi. */
export function useCpi() {
  const [entries, setEntries] = useState<CpiEntry[]>([]);
  const [cpiMap, setCpiMap] = useState<Map<number, number>>(new Map());
  const [latestYear, setLatestYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/cpi').then(r => r.json()),
      fetch('/api/cpi/latest-year').then(r => r.json())
    ])
      .then(([data, latestYearData]: [CpiEntry[], { year: number }]) => {
        setEntries(data);
        setCpiMap(buildRpiMap(data));
        setLatestYear(latestYearData.year);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { entries, cpiMap, latestYear, loading, error };
}
