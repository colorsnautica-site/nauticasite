export const MAX_PRICE_CENTS = 999_999_999;

// Formato brasileiro inequívoco: 1234, 1.234, 1234,56 ou 1.234,56.
export function parseReaisToCents(input: string): number | null {
  const cleaned = input.replace(/^\s*r\$\s*/i, "").trim();
  if (cleaned === "") return 0;

  const valid = /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(cleaned);
  if (!valid) return null;

  const [wholePart, decimalPart = ""] = cleaned.split(",");
  const whole = Number(wholePart.replace(/\./g, ""));
  const cents = whole * 100 + Number(decimalPart.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > MAX_PRICE_CENTS) return null;
  return cents;
}

export function centsToReaisInput(cents: number): string {
  if (!cents || cents <= 0) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}
