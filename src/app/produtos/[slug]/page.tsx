import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ProductActionPanel } from "@/components/cart/ProductActionPanel";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductImage } from "@/components/ui/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { formatCurrency } from "@/lib/currency";
import { getCatalog } from "@/lib/catalog/get-catalog";
import { getProductBySlug } from "@/lib/catalog/get-product-by-slug";

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `${product.name} | Náutica Color` : "Produto | Náutica Color",
    description: product?.shortDescription
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products, settings } = await getCatalog();
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();

  const related = products
    .filter((item) => item.id !== product.id && (item.categoryId === product.categoryId || item.brandId === product.brandId))
    .slice(0, 4);

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-ink/60">
          <Link href="/" className="hover:text-red">Início</Link>
          <ChevronRight size={16} aria-hidden="true" />
          <Link href="/produtos" className="hover:text-red">Produtos</Link>
          <ChevronRight size={16} aria-hidden="true" />
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl bg-sky p-8 shadow-soft">
            <ProductImage src={product.imageUrl} alt={product.name} className="mx-auto h-[420px] w-full object-contain" />
          </div>
          <div>
            <p className="font-bold uppercase tracking-[0.2em] text-red">{product.brand?.name}</p>
            <h1 className="mt-3 font-heading text-5xl font-extrabold leading-tight text-navy">{product.name}</h1>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy">{product.category?.name}</span>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy">{product.unit}</span>
              <span className="rounded-full bg-red/10 px-4 py-2 text-sm font-semibold text-red">Preço de referência</span>
            </div>
            <p className="mt-7 font-heading text-4xl font-extrabold text-ink">{formatCurrency(product.priceCents)}</p>
            <p className="mt-3 text-sm font-semibold text-red">Valores demonstrativos sujeitos à confirmação de preço e disponibilidade.</p>
            <p className="mt-6 text-lg leading-8 text-ink/75">{product.description || product.shortDescription}</p>
            <p className="mt-4 rounded-lg bg-white p-4 text-sm font-semibold text-navy shadow-sm">
              Confirme disponibilidade, especificações e aplicação correta com nossa equipe.
            </p>
            <div className="mt-8">
              <ProductActionPanel product={product} settings={settings} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-extrabold text-navy">Produtos relacionados</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item, index) => (
              <Reveal key={item.id} delay={(index % 4) * 180} className="h-full">
                <ProductCard product={item} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
