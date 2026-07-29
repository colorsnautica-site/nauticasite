import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/Eyebrow";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import { getCategoryBySlug, getProductBySku } from "@/data/catalog";

export async function generateMetadata({
  params
}: {
  params: Promise<{ categoria: string; sku: string }>;
}): Promise<Metadata> {
  const { categoria, sku } = await params;
  const category = getCategoryBySlug(categoria);
  if (!category) return {};
  const product = await getProductBySku(categoria, sku);
  if (!product) return {};
  return {
    title: `${product.name} | Náutica Color`,
    description: `${product.name}${product.brandName ? ` (${product.brandName})` : ""} — ${category.name} na Náutica Color.`
  };
}

export default async function ProdutoDetalhePage({
  params
}: {
  params: Promise<{ categoria: string; sku: string }>;
}) {
  const { categoria, sku } = await params;
  const category = getCategoryBySlug(categoria);
  if (!category) notFound();

  const product = await getProductBySku(categoria, sku);
  if (!product) notFound();

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <Eyebrow>{category.name}</Eyebrow>
        <div className="mt-6">
          <ProductDetailView product={product} />
        </div>
      </div>
    </section>
  );
}
