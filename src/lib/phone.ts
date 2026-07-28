const VALID_DDDS = new Set([
  11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,
  41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,68,
  69,71,73,74,75,77,79,81,82,83,84,85,86,87,88,89,91,92,93,94,
  95,96,97,98,99
]);

export function normalizeBrazilPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }
  if (digits.length !== 10 && digits.length !== 11) return null;

  const ddd = Number(digits.slice(0, 2));
  const subscriber = digits.slice(2);
  if (!VALID_DDDS.has(ddd)) return null;
  if (subscriber.length === 9 && subscriber[0] !== "9") return null;
  if (subscriber.length === 8 && !/^[2-5]/.test(subscriber)) return null;
  if (/^(\d)\1+$/.test(subscriber)) return null;
  return `+55${digits}`;
}

export function phoneToDigits(phone: string): string | null {
  const normalized = normalizeBrazilPhone(phone);
  return normalized ? normalized.slice(1) : null;
}

export function normalizeInstagram(input: string): string | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^(?:https?:\/\/(?:www\.)?instagram\.com\/)?@?([A-Za-z0-9._]{1,30})\/?$/i);
  return match ? `@${match[1]}` : null;
}

export function instagramUrl(value: string): string | null {
  const normalized = normalizeInstagram(value);
  return normalized ? `https://www.instagram.com/${normalized.slice(1)}/` : null;
}
