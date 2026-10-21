import { describe, expect, it } from 'vitest';
import { formatLsd, fromDecimal, isLsdYear, parseLsd, toDecimal } from './lsd';

describe('toDecimal', () => {
  it('converts pounds, shillings and pence (20s to the pound, 12d to the shilling)', () => {
    expect(toDecimal({ pounds: 1, shillings: 0, pence: 0 })).toBe(1);
    expect(toDecimal({ pounds: 0, shillings: 1, pence: 0 })).toBe(0.05);
    expect(toDecimal({ pounds: 0, shillings: 0, pence: 1 })).toBeCloseTo(1 / 240, 10);
  });
});

describe('fromDecimal', () => {
  it('splits a decimal amount into pounds, shillings and pence', () => {
    expect(fromDecimal(1.525)).toEqual({ pounds: 1, shillings: 10, pence: 6 });
  });

  it('rounds to the nearest penny, carrying into shillings and pounds', () => {
    expect(fromDecimal(0.9999)).toEqual({ pounds: 1, shillings: 0, pence: 0 });
    expect(fromDecimal(0.0499)).toEqual({ pounds: 0, shillings: 1, pence: 0 });
  });

  it('handles zero and large amounts', () => {
    expect(fromDecimal(0)).toEqual({ pounds: 0, shillings: 0, pence: 0 });
    const large = { pounds: 12345, shillings: 6, pence: 8 };
    expect(fromDecimal(toDecimal(large))).toEqual(large);
  });
});

describe('formatLsd', () => {
  it('writes £1 and over in full', () => {
    expect(formatLsd({ pounds: 1, shillings: 10, pence: 6 })).toBe('£1 10s 6d');
    expect(formatLsd({ pounds: 5, shillings: 0, pence: 0 })).toBe('£5 0s 0d');
    expect(formatLsd({ pounds: 12345, shillings: 6, pence: 8 })).toBe('£12,345 6s 8d');
  });

  it('writes under £1 as shillings/pence, "-" for no pence, and pence alone as d', () => {
    expect(formatLsd({ pounds: 0, shillings: 10, pence: 6 })).toBe('10/6');
    expect(formatLsd({ pounds: 0, shillings: 10, pence: 0 })).toBe('10/-');
    expect(formatLsd({ pounds: 0, shillings: 0, pence: 6 })).toBe('6d');
    expect(formatLsd({ pounds: 0, shillings: 0, pence: 0 })).toBe('0d');
  });
});

describe('parseLsd', () => {
  it.each([
    ['£1 10s 6d', { pounds: 1, shillings: 10, pence: 6 }],
    ['10s 6d', { pounds: 0, shillings: 10, pence: 6 }],
    ['6d', { pounds: 0, shillings: 0, pence: 6 }],
    ['£1', { pounds: 1, shillings: 0, pence: 0 }],
    ['1/10/6', { pounds: 1, shillings: 10, pence: 6 }],
    ['10/6', { pounds: 0, shillings: 10, pence: 6 }],
    ['10/-', { pounds: 0, shillings: 10, pence: 0 }],
    ['  £2 5s  ', { pounds: 2, shillings: 5, pence: 0 }],
  ])('accepts %s', (input, expected) => {
    expect(parseLsd(input)).toEqual(expected);
  });

  // Out-of-range parts are rejected, not normalised: "25s" is an error, not £1 5s.
  it.each(['', '   ', 'abc', '-1', '£-1', '25s', '12d', '£1 20s', '20/-', '1/10/12', '1.525', '£1.50'])(
    'rejects %j',
    input => {
      expect(parseLsd(input)).toBeNull();
    });
});

describe('isLsdYear', () => {
  it('is true up to 1970; Decimal Day was 15 February 1971', () => {
    expect(isLsdYear(1209)).toBe(true);
    expect(isLsdYear(1970)).toBe(true);
    expect(isLsdYear(1971)).toBe(false);
    expect(isLsdYear(2026)).toBe(false);
  });
});
