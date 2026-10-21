import { formatCurrency } from './inflation';

/** Pre-decimal sterling: 20 shillings to the pound, 12 pence to the shilling. */
export interface Lsd {
  pounds: number;
  shillings: number;
  pence: number;
}

export function toDecimal({ pounds, shillings, pence }: Lsd): number {
  return pounds + shillings / 20 + pence / 240;
}

/** Rounds to the nearest farthing, so pence may be fractional in quarters. */
export function fromDecimal(amount: number): Lsd {
  const farthings = Math.round(amount * 960);
  return {
    pounds: Math.floor(farthings / 960),
    shillings: Math.floor((farthings % 960) / 48),
    pence: (farthings % 48) / 4,
  };
}

/** "£1 10s 6d" from £1 up; under £1 the period shorthand "10/6" ("10/-" with no pence), or "6d". */
export function formatLsd({ pounds, shillings, pence }: Lsd): string {
  if (pounds > 0) return `£${pounds.toLocaleString('en-GB')} ${shillings}s ${pence}d`;
  if (shillings > 0) return `${shillings}/${pence > 0 ? pence : '-'}`;
  return `${pence}d`;
}

const NAMED = /^(?:£\s*(\d[\d,]*))?\s*(?:(\d+)s)?\s*(?:(\d+)d)?$/;
const SLASHED = /^(?:(\d[\d,]*)\/)?(\d+)\/(\d+|-)$/;

/** Reads "£1 10s 6d" (any part optional) or the slash forms "1/10/6", "10/6", "10/-". */
export function parseLsd(input: string): Lsd | null {
  const text = input.trim();
  const match = text.match(NAMED) ?? text.match(SLASHED);
  if (!text || !match) return null;
  const [, pounds = '0', shillings = '0', pence = '0'] = match;
  const lsd = {
    pounds: Number(pounds.replace(/,/g, '')),
    shillings: Number(shillings),
    pence: pence === '-' ? 0 : Number(pence),
  };
  return lsd.shillings < 20 && lsd.pence < 12 ? lsd : null;
}

/** Years shown in £sd. Decimal Day was 15 Feb 1971; at year granularity, 1971 counts as decimal. */
export function isLsdYear(year: number): boolean {
  return year < 1971;
}

/** An amount typed for a given year: £sd text before 1971, a plain decimal always. Null unless positive. */
export function parseAmount(input: string, year: number): number | null {
  const text = input.trim();
  const lsd = isLsdYear(year) ? parseLsd(text) : null;
  const amount = lsd ? toDecimal(lsd) : text === '' ? NaN : Number(text);
  return amount > 0 ? amount : null;
}

/** How an amount reads in a given year: £sd with the decimal alongside before 1971, else formatCurrency. */
export function formatAmount(value: number, year: number): string {
  if (!isLsdYear(year)) return formatCurrency(value);
  const decimal = value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${formatLsd(fromDecimal(value))} (£${decimal})`;
}
