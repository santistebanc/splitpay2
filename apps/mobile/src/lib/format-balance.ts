/** Formats integer cents as a currency amount (e.g. €12.00). */
export function formatAmountCents(
  amountCents: number,
  currency: string
): string {
  const amount = (amountCents / 100).toFixed(2);
  const prefix = currency === "EUR" ? "€" : `${currency} `;
  return `${prefix}${amount}`;
}

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
