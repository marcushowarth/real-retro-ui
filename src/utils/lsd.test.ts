import { describe, expect, it } from 'vitest';
import { fromDecimal, toDecimal } from './lsd';

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
