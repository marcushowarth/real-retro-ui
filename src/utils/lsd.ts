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
