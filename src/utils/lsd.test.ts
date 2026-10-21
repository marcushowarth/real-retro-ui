import { describe, expect, it } from 'vitest';
import { toDecimal } from './lsd';

describe('toDecimal', () => {
  it('converts pounds, shillings and pence (20s to the pound, 12d to the shilling)', () => {
    expect(toDecimal({ pounds: 1, shillings: 0, pence: 0 })).toBe(1);
    expect(toDecimal({ pounds: 0, shillings: 1, pence: 0 })).toBe(0.05);
    expect(toDecimal({ pounds: 0, shillings: 0, pence: 1 })).toBeCloseTo(1 / 240, 10);
  });
});
