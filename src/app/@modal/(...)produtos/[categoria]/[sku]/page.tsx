import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductBySku } from "@/data/catalog";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import { InterceptedModalCloser } from "@/components/products/InterceptedModalCloser";

export default async function ProdutoModalPage({
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
    <InterceptedModalCloser labelledBy="product-detail-title">
      <ProductDetailView product={product} />
    </InterceptedModalCloser>
  );
}
