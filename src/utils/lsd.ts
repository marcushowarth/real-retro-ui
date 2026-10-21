/** Pre-decimal sterling: 20 shillings to the pound, 12 pence to the shilling. */
export interface Lsd {
  pounds: number;
  shillings: number;
  pence: number;
}

export function toDecimal({ pounds, shillings, pence }: Lsd): number {
  return pounds + shillings / 20 + pence / 240;
}
