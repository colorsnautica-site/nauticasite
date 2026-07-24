import Link from "next/link";

const CARDS = [
  { href: "/admin/produtos", title: "Produtos", desc: "Editar nome, foto, preço, disponibilidade e categoria." },
  { href: "/admin/conteudo", title: "Conteúdo do site", desc: "Hero (fundo, título, descrição) e contato." },
  { href: "/admin/marcas", title: "Marcas parceiras", desc: "Logos exibidos na seção Marcas." },
  { href: "/admin/historico", title: "Histórico", desc: "Ver alterações e desfazer." }
];

export default function AdminHome() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-extrabold text-navy">Início</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
            <h2 className="font-heading text-xl font-bold text-navy">{c.title}</h2>
            <p className="mt-2 text-sm text-ink/70">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
