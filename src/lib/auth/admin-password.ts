import { createHash, timingSafeEqual } from "node:crypto";

function getAdminPassword(): string {
  const value = process.env.ADMIN_PASSWORD ?? "";
  if (!value) throw new Error("ADMIN_PASSWORD não configurada.");
  return value;
}

export function checkPassword(input: string): boolean {
  const expected = getAdminPassword();
  const actualDigest = createHash("sha256").update(input).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualDigest, expectedDigest);
}
