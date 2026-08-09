import { DataPoint } from '../types';

/**
 * Onboarding example — real motorbike prices across three series, sourced
 * (not guessed) so the demo is trustworthy, not just illustrative:
 *
 * - Honda CBR600RR: £9,500 launch RRP 2013 (Bennetts BikeSocial review,
 *   "Brand new it cost £9500"), £10,499 OTR 2024 relaunch (Motorcycle
 *   News, the CBR600RR was off UK sale 2017-2023 and returned for 2024).
 * - Triumph Tiger 900 GT: £11,500 launch RRP 2020 (MCN launch review),
 *   £12,395 OTR current (triumphmotorcycles.co.uk official listing).
 * - BMW R1200GS: £9,275 new-bike RRP 2004 (Bennetts BikeSocial review),
 *   £12,160.67 2009-07-28 (Marcus's own purchase receipt — includes
 *   luggage & alarm, so not a bare bike-only price like the other points).
 *
 * The two "2024"/current points are OTR (on-the-road, includes
 * registration/VED/delivery) while the older points are plain launch RRP
 * or (BMW 2009) an as-paid price with extras — a mild basis inconsistency
 * worth knowing about, but normal for real-world "what did this cost"
 * data and not worth re-normalising for an onboarding example.
 *
 * See Kanban #978 (REAL RETRO dataset onboarding).
 */
export const EXAMPLE_DATASET_NAME = 'Motorbikes (example)';

/**
 * The exact wide CSV format CsvImport.tsx expects: date,SeriesA,SeriesB,...
 * with blank cells for a series with no data point on that date. Shown
 * verbatim in the guide panel so it doubles as format documentation.
 */
export const EXAMPLE_CSV = `date,Honda CBR600RR,Triumph Tiger 900 GT,BMW R1200GS
2004-01-01,,,9275
2009-07-28,,,12160.67
2013-01-01,9500,,
2020-01-01,,11500,
2024-01-01,10499,12395,`;

export function buildExamplePoints(datasetId: string): DataPoint[] {
  return [
    { datasetId, seriesName: 'Honda CBR600RR', date: '2013-01-01', amount: 9500 },
    { datasetId, seriesName: 'Honda CBR600RR', date: '2024-01-01', amount: 10499 },
    { datasetId, seriesName: 'Triumph Tiger 900 GT', date: '2020-01-01', amount: 11500 },
    { datasetId, seriesName: 'Triumph Tiger 900 GT', date: '2024-01-01', amount: 12395 },
    { datasetId, seriesName: 'BMW R1200GS', date: '2004-01-01', amount: 9275 },
    { datasetId, seriesName: 'BMW R1200GS', date: '2009-07-28', amount: 12160.67 },
  ];
}
