/** Formats integer cents as a signed currency amount (e.g. +€6.00). */
export function formatBalanceCents(
  balanceCents: number,
  currency: string
): string {
  const amount = (Math.abs(balanceCents) / 100).toFixed(2);
  const prefix = currency === "EUR" ? "€" : `${currency} `;
  if (balanceCents > 0) {
    return `+${prefix}${amount}`;
  }
  if (balanceCents < 0) {
    return `-${prefix}${amount}`;
  }
  return `${prefix}${amount}`;
}
