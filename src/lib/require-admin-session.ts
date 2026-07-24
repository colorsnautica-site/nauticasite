import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

// Reforço de sessão dentro das Server Actions: o middleware protege a rota,
// mas uma Server Action pode ser invocada diretamente (POST com o ID da action),
// sem passar pela rota protegida — por isso cada action de escrita chama isto também.
export async function requireAdminSession(): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    throw new Error("Não autorizado.");
  }
}
