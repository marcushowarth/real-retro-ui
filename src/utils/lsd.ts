/** Pre-decimal sterling: 20 shillings to the pound, 12 pence to the shilling. */
export interface Lsd {
  pounds: number;
  shillings: number;
  pence: number;
}

export function toDecimal({ pounds, shillings, pence }: Lsd): number {
  return pounds + shillings / 20 + pence / 240;
}

export function fromDecimal(amount: number): Lsd {
  const totalPence = Math.round(amount * 240);
  return {
    pounds: Math.floor(totalPence / 240),
    shillings: Math.floor((totalPence % 240) / 12),
    pence: totalPence % 12,
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
  return {
    pounds: Number(pounds.replace(/,/g, '')),
    shillings: Number(shillings),
    pence: pence === '-' ? 0 : Number(pence),
  };
}
