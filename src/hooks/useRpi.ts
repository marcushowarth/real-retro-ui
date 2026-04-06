import { useEffect, useState } from 'react';
import { RpiEntry } from '../types';
import { buildRpiMap } from '../utils/inflation';

export function useRpi() {
  const [entries, setEntries] = useState<RpiEntry[]>([]);
  const [rpiMap, setRpiMap] = useState<Map<number, number>>(new Map());
  const [latestYear, setLatestYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/rpi').then(r => r.json()),
      fetch('/api/rpi/latest-year').then(r => r.json())
    ])
      .then(([data, latestYearData]: [RpiEntry[], { year: number }]) => {
        setEntries(data);
        setRpiMap(buildRpiMap(data));
        setLatestYear(latestYearData.year);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { entries, rpiMap, latestYear, loading, error };
}
