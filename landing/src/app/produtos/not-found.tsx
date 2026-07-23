import Link from "next/link";

export default function ProdutosNotFound() {
  return (
    <section className="bg-white py-24 text-center">
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-extrabold text-navy">Categoria não encontrada</h1>
        <p className="mt-4 text-ink/70">Essa categoria não existe ou foi removida.</p>
        <Link
          href="/produtos"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-red px-5 text-sm font-semibold text-white transition hover:bg-red-bright"
        >
          Ver todos os produtos
        </Link>
      </div>
    </section>
  );
}
