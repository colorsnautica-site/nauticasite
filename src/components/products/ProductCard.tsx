import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CartStepper } from "@/components/cart/CartStepper";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/types/catalog";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full flex-col rounded-[28px] border border-navy/10 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link
        href={`/produtos/${product.slug}`}
        className="block overflow-hidden rounded-3xl bg-sky p-6 transition group-hover:bg-mist"
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="mx-auto h-44 w-full object-contain transition-transform duration-300 ease-nautica group-hover:scale-105"
        />
      </Link>
      <div className="mt-4 flex flex-1 flex-col px-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red">{product.brand?.name}</p>
        <h2 className="mt-2 font-heading text-lg font-bold leading-tight text-navy">
          <Link href={`/produtos/${product.slug}`} className="hover:text-red">{product.name}</Link>
        </h2>
        <p className="mt-1 text-sm text-ink/65">{product.unit}</p>
        <p className="mt-3 flex-1 text-sm leading-6 text-ink/75">{product.shortDescription}</p>
        <div className="mt-4">
          <span className="inline-flex items-center rounded-full bg-sky px-3 py-1 text-xs font-bold text-navy">
            Preço de referência
          </span>
          <p className="mt-2 font-heading text-2xl font-bold text-ink">{formatCurrency(product.priceCents)}</p>
          <p className="mt-1 text-xs text-ink/55">Valores demonstrativos sujeitos à confirmação de preço e disponibilidade.</p>
        </div>
        <div className="mt-5 flex items-center gap-2">
          <CartStepper product={product} className="flex-1" />
          <Link
            href={`/produtos/${product.slug}`}
            aria-label={`Ver detalhes de ${product.name}`}
            className="inline-flex min-h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky text-navy transition hover:bg-navy hover:text-white"
          >
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
