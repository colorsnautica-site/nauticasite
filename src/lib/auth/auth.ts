import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "nautica_admin";
const ALG = "HS256";
const MAX_AGE_SECONDS = 60 * 60 * 8;
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;

export function getSessionSecret(): string {
  const value = process.env.SESSION_SECRET ?? "";
  if (value.length < 32) throw new Error("SESSION_SECRET deve ter pelo menos 32 caracteres.");
  return value;
}

function secretBytes(): Uint8Array {
  return new TextEncoder().encode(getSessionSecret());
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretBytes());
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretBytes());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
