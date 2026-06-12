/** Parses a decimal amount string into integer cents, or null when invalid. */
export function parseAmountToCents(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  return Math.round(parseFloat(normalized) * 100);
}
