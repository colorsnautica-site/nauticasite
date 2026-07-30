import Link from "next/link";
import { logout } from "@/app/admin/actions/auth";

const LINKS = [
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/conteudo", label: "Conteúdo do site" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/historico", label: "Histórico" }
];

export function AdminNav() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-navy/10 bg-white px-6 py-4">
      <Link href="/admin" className="font-heading text-lg font-extrabold text-navy">Painel Náutica Color</Link>
      <nav className="flex flex-wrap items-center gap-2">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-full px-4 py-2 text-sm font-semibold text-navy/80 transition hover:bg-sky">
            {l.label}
          </Link>
        ))}
        <form action={logout}>
          <button type="submit" className="rounded-full px-4 py-2 text-sm font-semibold text-red transition hover:bg-red/10">Sair</button>
        </form>
      </nav>
    </header>
  );
}
