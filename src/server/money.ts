export function toMinorUnits(amount: number | string): bigint {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return BigInt(Math.round(numAmount * 100));
}

export function toMajor(amountMinor: bigint): string {
  const major = Number(amountMinor) / 100;
  return major.toFixed(2);
}
