import type { Metadata } from "next";
import { Eyebrow } from "@/components/Eyebrow";
import { CategoryTabs } from "@/components/products/CategoryTabs";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Pagination } from "@/components/products/Pagination";
import { categories, getAllProducts, paginate } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Todos os produtos | Náutica Color",
  description: "Catálogo completo de produtos da Náutica Color, por categoria."
};

export default async function ProdutosPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const { items, page: currentPage, totalPages, total } = paginate(getAllProducts(), page);

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Eyebrow>Catálogo</Eyebrow>
        <h1 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
          Todos os produtos
        </h1>
        <p className="mt-3 text-ink/70">{total} produtos no catálogo completo.</p>

        <div className="mt-8">
          <CategoryTabs mode="links" categories={categories} />
        </div>

        <div className="mt-8">
          <ProductGrid products={items} />
        </div>

        <Pagination basePath="/produtos" page={currentPage} totalPages={totalPages} />
      </div>
    </section>
  );
}
