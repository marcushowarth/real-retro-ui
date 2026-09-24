/** One calendar year's reading from a price-index series (RPI or CPI) — /api/index/{series}. */
export interface IndexEntry {
  year: number;
  index: number;
}

export interface DataPoint {
  id?: number;
  datasetId: string;
  seriesName: string;
  colour?: string;
  date: string;       // ISO date string YYYY-MM-DD
  amount: number;
}

export interface Dataset {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/** A DataPoint with its inflation-adjusted value for the current reference year */
export interface AdjustedPoint extends DataPoint {
  adjustedAmount: number;      // RPI-adjusted — kept as the primary field, existing consumers unaffected
  adjustedAmountCpi: number;   // CPI-adjusted twin, kanban #981
}
