import { login } from "@/app/admin/actions/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-navy px-4">
      <form action={login} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="font-heading text-2xl font-extrabold text-navy">Painel Náutica Color</h1>
        <p className="mt-1 text-sm text-ink/60">Entre com a senha de administrador.</p>
        {erro ? <p className="mt-4 rounded-lg bg-red/10 px-3 py-2 text-sm text-red">Senha incorreta.</p> : null}
        <input type="password" name="password" required autoFocus placeholder="Senha"
          className="mt-4 w-full rounded-full border border-navy/15 px-4 py-3 outline-none focus:border-navy" />
        <button type="submit" className="mt-4 h-12 w-full rounded-full bg-red font-semibold text-white transition hover:bg-red-bright">
          Entrar
        </button>
      </form>
    </main>
  );
}
