import { createHash, timingSafeEqual } from "node:crypto";

export function getAdminPassword(): string {
  const value = process.env.ADMIN_PASSWORD ?? "";
  if (value.length < 14) throw new Error("ADMIN_PASSWORD deve ter pelo menos 14 caracteres.");
  return value;
}

export function checkPassword(input: string): boolean {
  const expected = getAdminPassword();
  const actualDigest = createHash("sha256").update(input).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualDigest, expectedDigest);
}
