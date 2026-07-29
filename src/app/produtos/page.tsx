import type { Metadata } from "next";
import { Eyebrow } from "@/components/Eyebrow";
import { CategoryTabs } from "@/components/products/CategoryTabs";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Pagination } from "@/components/products/Pagination";
import { ProductSearch } from "@/components/products/ProductSearch";
import { categories, getAllProducts, paginate } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Todos os produtos | Náutica Color",
  description: "Catálogo completo de produtos da Náutica Color, por categoria."
};

export default async function ProdutosPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q = "" } = await searchParams;
  const page = Number(pageParam) || 1;
  const all = await getAllProducts();
  const query = q.trim();
  const normalizedQuery = normalizeSearch(query);
  const filtered = normalizedQuery
    ? all.filter((product) => normalizeSearch(`${product.name} ${product.sku} ${product.brandName}`).includes(normalizedQuery))
    : all;
  const { items, page: currentPage, totalPages, total } = paginate(filtered, page);

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Eyebrow>Catálogo</Eyebrow>
        <h1 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
          Todos os produtos
        </h1>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-sm text-ink/70 sm:text-base">
            {query ? `${total} ${total === 1 ? "produto encontrado" : "produtos encontrados"}.` : `${total} produtos no catálogo completo.`}
          </p>
          <ProductSearch initialQuery={query} />
        </div>

        <div className="mt-8">
          <CategoryTabs mode="links" categories={categories} />
        </div>

        <div className="mt-8">
          <ProductGrid
            products={items}
            emptyMessage={query ? "Nenhum produto encontrado para essa busca." : undefined}
          />
        </div>

        <Pagination basePath="/produtos" page={currentPage} totalPages={totalPages} params={{ q: query || undefined }} />
      </div>
    </section>
  );
}

function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("pt-BR");
}
