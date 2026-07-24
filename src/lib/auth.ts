import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "nautica_admin";
const ALG = "HS256";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET não definida");
  return new TextEncoder().encode(s);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: ALG }).setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`).sign(secret());
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch { return false; }
}

// Comparação em tempo (quase) constante para não vazar o tamanho da senha.
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (expected.length === 0) return false;
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
