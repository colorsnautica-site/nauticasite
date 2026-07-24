import Link from "next/link";
import { getAllProducts, categories, paginate } from "@/data/catalog";
import { ProductRow } from "@/app/admin/(painel)/_components/ProductRow";
import { ImageUploader } from "@/app/admin/(painel)/_components/ImageUploader";
import { createProductAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProdutos({
  searchParams
}: { searchParams: Promise<{ q?: string; cat?: string; page?: string }> }) {
  const { q = "", cat = "", page = "1" } = await searchParams;
  const all = await getAllProducts();
  const termo = q.trim().toLowerCase();
  const filtered = all.filter((p) =>
    (cat ? p.categorySlug === cat : true) &&
    (termo ? (p.name.toLowerCase().includes(termo) || p.sku.toLowerCase().includes(termo)) : true)
  );
  const pageData = paginate(filtered, Number(page) || 1, 20);

  return (
    <div>
      <h1 className="font-heading text-3xl font-extrabold text-navy">Produtos ({filtered.length})</h1>

      <form className="mt-4 flex flex-wrap gap-2" method="get">
        <input name="q" defaultValue={q} placeholder="Buscar por nome ou código"
          className="min-w-[240px] flex-1 rounded-full border border-navy/15 px-4 py-2 text-sm" />
        <select name="cat" defaultValue={cat} className="rounded-full border border-navy/15 px-4 py-2 text-sm">
          <option value="">Todas as categorias</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <button className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white">Filtrar</button>
      </form>

      <details className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
        <summary className="cursor-pointer font-semibold text-navy">+ Adicionar produto</summary>
        <form action={createProductAction} className="mt-4 grid gap-3 sm:grid-cols-[auto_2fr_1fr_1fr_1fr_1fr]">
          <ImageUploader />
          <input name="name" required placeholder="Nome" className="rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
          <input name="brandName" placeholder="Marca" className="rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
          <input name="precoReais" placeholder="Preço (R$)" className="rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
          <select name="categorySlug" className="rounded-lg border border-navy/15 px-2 py-1.5 text-sm">
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <input name="sku" placeholder="Código (opcional)" className="rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
          <button className="rounded-full bg-red px-4 py-2 text-xs font-semibold text-white">Adicionar</button>
        </form>
      </details>

      <div className="mt-6 space-y-3">
        {pageData.items.map((p) => <ProductRow key={p.id} product={p} categories={categories} />)}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {Array.from({ length: pageData.totalPages }, (_, i) => i + 1)
          .filter((n) => Math.abs(n - pageData.page) < 4 || n === 1 || n === pageData.totalPages)
          .map((n) => (
            <Link key={n} href={`/admin/produtos?q=${encodeURIComponent(q)}&cat=${cat}&page=${n}`}
              className={`grid h-9 w-9 place-items-center rounded-full text-sm ${n === pageData.page ? "bg-navy text-white" : "text-navy hover:bg-sky"}`}>
              {n}
            </Link>
          ))}
      </div>
    </div>
  );
}
