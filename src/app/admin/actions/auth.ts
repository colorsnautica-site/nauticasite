"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { checkPassword } from "@/lib/admin-password";
import {
  clearLoginAttempts,
  hashLoginIdentifier,
  loginIdentifierFromHeaders,
  loginIsBlocked,
  registerFailedLogin
} from "@/lib/login-rate-limit";

const MIN_FAILURE_DURATION_MS = 750;

async function waitForUniformFailure(startedAt: number): Promise<void> {
  const remaining = MIN_FAILURE_DURATION_MS - (Date.now() - startedAt);
  if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
}

export async function login(formData: FormData) {
  const startedAt = Date.now();
  const identifier = loginIdentifierFromHeaders(await headers());
  const identifierHash = hashLoginIdentifier(identifier);
  const password = String(formData.get("password") ?? "");

  if (await loginIsBlocked(identifierHash)) {
    await waitForUniformFailure(startedAt);
    redirect("/admin/login?erro=1");
  }

  let valid = false;
  try {
    valid = checkPassword(password);
  } catch (error) {
    console.error("Configuração de autenticação inválida", error);
  }

  if (!valid) {
    await registerFailedLogin(identifierHash);
    await waitForUniformFailure(startedAt);
    redirect("/admin/login?erro=1");
  }

  await clearLoginAttempts(identifierHash);
  const token = await createSessionToken();
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
