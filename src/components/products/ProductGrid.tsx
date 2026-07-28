import type { Product } from "@/data/catalog";
import { productWhatsappUrl } from "@/lib/whatsapp";
import { ProductCard } from "@/components/products/ProductCard";

export function ProductGrid({
  products,
  whatsappNumber,
  emptyMessage = "Nenhum produto encontrado nesta categoria."
}: {
  products: Product[];
  whatsappNumber?: string;
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return <p className="py-12 text-center text-sm text-ink/60">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} whatsappUrl={productWhatsappUrl(product, whatsappNumber)} />
      ))}
    </div>
  );
}
