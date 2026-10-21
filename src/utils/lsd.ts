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

const FRACTIONS: Record<number, string> = { 0: '', 0.25: '¼', 0.5: '½', 0.75: '¾' };

/** "6½": whole pence then the farthing fraction. */
function penceText(pence: number): string {
  const whole = Math.floor(pence);
  return `${whole}${FRACTIONS[pence - whole]}`;
}

/** "£1 10s 6½d" from £1 up; under £1 the period shorthand "10/6½" ("10/-" with no pence), or "6½d" / "½d". */
export function formatLsd({ pounds, shillings, pence }: Lsd): string {
  if (pounds > 0) return `£${pounds.toLocaleString('en-GB')} ${shillings}s ${penceText(pence)}d`;
  if (shillings > 0) return `${shillings}/${pence > 0 ? penceText(pence) : '-'}`;
  return `${pence > 0 && pence < 1 ? FRACTIONS[pence] : penceText(pence)}d`;
}

const NAMED = /^(?:£\s*(\d[\d,]*))?\s*(?:(\d+)s)?\s*(?:(\d+[¼½¾]?|[¼½¾])d)?$/;
const SLASHED = /^(?:(\d[\d,]*)\/)?(\d+)\/(\d+[¼½¾]?|-)$/;

/** "6½" → 6.5, "½" → 0.5, "-" → 0. */
function parsePence(text: string): number {
  if (text === '-') return 0;
  const fraction = Object.entries(FRACTIONS).find(([, symbol]) => symbol && text.endsWith(symbol));
  return fraction ? Number(text.slice(0, -1) || 0) + Number(fraction[0]) : Number(text);
}

/** Reads "£1 10s 6½d" (any part optional) or the slash forms "1/10/6", "10/6½", "10/-". */
export function parseLsd(input: string): Lsd | null {
  const text = input.trim();
  const match = text.match(NAMED) ?? text.match(SLASHED);
  if (!text || !match) return null;
  const [, pounds = '0', shillings = '0', pence = '0'] = match;
  const lsd = {
    pounds: Number(pounds.replace(/,/g, '')),
    shillings: Number(shillings),
    pence: parsePence(pence),
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
  return `${formatLsd(fromDecimal(value))} (${formatPounds(value)})`;
}

/** "£1,234.56": pounds to the penny, where formatCurrency would round to whole pounds. */
export function formatPounds(value: number): string {
  return `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
