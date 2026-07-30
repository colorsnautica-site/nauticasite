import { createHmac } from "node:crypto";
import { and, eq, isNull, lt, or } from "drizzle-orm";
import { db } from "@/db/client";
import { adminLoginAttempts } from "@/db/schema";
import { getSessionSecret } from "@/lib/auth/auth";
import { isLoginBlocked, nextFailedLoginState } from "@/lib/auth/rate-limit-policy";

const RETENTION_MS = 24 * 60 * 60 * 1000;

export function loginIdentifierFromHeaders(headers: Headers): string {
  const vercel = headers.get("x-vercel-forwarded-for")?.trim();
  if (vercel) return vercel.slice(0, 255);
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || "unknown").slice(0, 255);
}

export function hashLoginIdentifier(identifier: string): string {
  return createHmac("sha256", getSessionSecret()).update(identifier).digest("hex");
}

export async function loginIsBlocked(identifierHash: string, now = new Date()): Promise<boolean> {
  const [row] = await db.select().from(adminLoginAttempts)
    .where(eq(adminLoginAttempts.identifierHash, identifierHash));
  return isLoginBlocked(row ?? null, now);
}

export async function registerFailedLogin(identifierHash: string, now = new Date()): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(adminLoginAttempts).where(and(
      lt(adminLoginAttempts.updatedAt, new Date(now.getTime() - RETENTION_MS)),
      or(isNull(adminLoginAttempts.blockedUntil), lt(adminLoginAttempts.blockedUntil, now))
    ));

    await tx.insert(adminLoginAttempts).values({
      identifierHash,
      windowStartedAt: now,
      attemptCount: 0,
      blockedUntil: null,
      updatedAt: now
    }).onConflictDoNothing();

    const [current] = await tx.select().from(adminLoginAttempts)
      .where(eq(adminLoginAttempts.identifierHash, identifierHash))
      .for("update");
    const next = nextFailedLoginState(current, now);
    await tx.update(adminLoginAttempts).set({ ...next, updatedAt: now })
      .where(eq(adminLoginAttempts.identifierHash, identifierHash));
  });
}

export async function clearLoginAttempts(identifierHash: string): Promise<void> {
  await db.delete(adminLoginAttempts).where(eq(adminLoginAttempts.identifierHash, identifierHash));
}
