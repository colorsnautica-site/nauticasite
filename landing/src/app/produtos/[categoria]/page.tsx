import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/Eyebrow";
import { CategoryTabs } from "@/components/products/CategoryTabs";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Pagination } from "@/components/products/Pagination";
import { categories, getCategoryBySlug, getProductsByCategory, paginate } from "@/data/catalog";

export function generateStaticParams() {
  return categories.map((category) => ({ categoria: category.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  const category = getCategoryBySlug(categoria);
  if (!category) return {};
  return {
    title: `${category.name} | Náutica Color`,
    description: `Produtos da categoria ${category.name} disponíveis na Náutica Color.`
  };
}

export default async function CategoriaPage({
  params,
  searchParams
}: {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { categoria } = await params;
  const category = getCategoryBySlug(categoria);
  if (!category) notFound();

  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const { items, page: currentPage, totalPages, total } = paginate(getProductsByCategory(categoria), page);

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Eyebrow>Categoria</Eyebrow>
        <h1 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
          {category.name}
        </h1>
        <p className="mt-3 text-ink/70">{total} produtos nesta categoria.</p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <CategoryTabs mode="links" categories={categories} />
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 font-semibold text-navy transition hover:text-red"
          >
            Ver todos os produtos <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8">
          <ProductGrid products={items} />
        </div>

        <Pagination basePath={`/produtos/${categoria}`} page={currentPage} totalPages={totalPages} />
      </div>
    </section>
  );
}
