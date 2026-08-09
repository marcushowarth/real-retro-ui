import { DataPoint } from '../types';

/**
 * Onboarding example — motorbike prices across three series, deliberately
 * spanning a real spread of years so the inflation adjustment is visible.
 * See Kanban #978 (REAL RETRO dataset onboarding).
 */
export const EXAMPLE_DATASET_NAME = 'Motorbikes (example)';

/**
 * The exact wide CSV format CsvImport.tsx expects: date,SeriesA,SeriesB,...
 * with blank cells for a series with no data point on that date. Shown
 * verbatim in the guide panel so it doubles as format documentation.
 */
export const EXAMPLE_CSV = `date,Honda CBR600RR,Triumph Tiger 900,BMW R1200 GS
2003-01-01,7199,,
2010-01-01,,,11500
2013-01-01,9199,,
2015-01-01,,,13200
2019-01-01,,,14650
2020-01-01,,11300,
2023-01-01,11099,12700,`;

export function buildExamplePoints(datasetId: string): DataPoint[] {
  return [
    { datasetId, seriesName: 'Honda CBR600RR', date: '2003-01-01', amount: 7199 },
    { datasetId, seriesName: 'Honda CBR600RR', date: '2013-01-01', amount: 9199 },
    { datasetId, seriesName: 'Honda CBR600RR', date: '2023-01-01', amount: 11099 },
    { datasetId, seriesName: 'Triumph Tiger 900', date: '2020-01-01', amount: 11300 },
    { datasetId, seriesName: 'Triumph Tiger 900', date: '2023-01-01', amount: 12700 },
    { datasetId, seriesName: 'BMW R1200 GS', date: '2010-01-01', amount: 11500 },
    { datasetId, seriesName: 'BMW R1200 GS', date: '2015-01-01', amount: 13200 },
    { datasetId, seriesName: 'BMW R1200 GS', date: '2019-01-01', amount: 14650 },
  ];
}
