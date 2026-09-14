import { RpiEntry, DataPoint, AdjustedPoint } from '../types';

/**
 * Build a year -> index lookup from the RPI series.
 */
export function buildRpiMap(entries: RpiEntry[]): Map<number, number> {
  return new Map(entries.map(e => [e.year, e.index]));
}

/**
 * Adjust a nominal amount to the reference year's purchasing power.
 * adjusted = nominal * (rpi[referenceYear] / rpi[dataYear])
 *
 * Returns nominal unchanged if either year is missing from the RPI map.
 */
export function adjust(
  amount: number,
  dataYear: number,
  referenceYear: number,
  rpiMap: Map<number, number>
): number {
  const dataIndex = rpiMap.get(dataYear);
  const refIndex = rpiMap.get(referenceYear);
  if (!dataIndex || !refIndex) return amount;
  return amount * (refIndex / dataIndex);
}

/**
 * Apply inflation adjustment to a list of data points, by both RPI and CPI.
 * cpiMap defaults to empty (yields adjustedAmountCpi === nominal, same
 * graceful-fallback behaviour as adjust() itself) so callers that don't
 * have CPI data loaded yet aren't forced to wait for it.
 */
export function adjustPoints(
  points: DataPoint[],
  referenceYear: number,
  rpiMap: Map<number, number>,
  cpiMap: Map<number, number> = new Map()
): AdjustedPoint[] {
  return points.map(p => {
    const dataYear = new Date(p.date).getFullYear();
    return {
      ...p,
      adjustedAmount: adjust(p.amount, dataYear, referenceYear, rpiMap),
      adjustedAmountCpi: adjust(p.amount, dataYear, referenceYear, cpiMap)
    };
  });
}

/**
 * Format currency for display.
 */
export function formatCurrency(amount: number, symbol = '£'): string {
  return `${symbol}${amount.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
}
