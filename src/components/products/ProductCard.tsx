import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CartStepper } from "@/components/cart/CartStepper";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/types/catalog";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const stockLabel = product.stockStatus === "available" ? "Disponível" : product.stockStatus === "unavailable" ? "Indisponível" : "Sob consulta";
  const stockBadge = product.stockStatus === "unavailable" ? "bg-red text-white" : "bg-white text-navy shadow-sm";

  return (
    <article className="group flex h-full flex-col rounded-[28px] border border-navy/10 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:border-red/20 hover:shadow-soft">
      <Link
        href={`/produtos/${product.slug}`}
        className={`relative block overflow-hidden rounded-3xl bg-sky transition group-hover:bg-mist ${compact ? "p-4" : "p-6"}`}
      >
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${stockBadge}`}>
          {stockLabel}
        </span>
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className={`mx-auto w-full object-contain transition-transform duration-300 ease-nautica group-hover:scale-105 ${compact ? "h-24" : "h-44"}`}
        />
      </Link>
      <div className={`flex flex-1 flex-col px-2 ${compact ? "mt-3" : "mt-4"}`}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-red">{product.brand?.name}</span>
          {product.category?.name ? (
            <span className="text-xs font-semibold text-ink/45">· {product.category.name}</span>
          ) : null}
        </div>
        <h2 className={`mt-1.5 font-heading font-bold leading-tight text-navy ${compact ? "text-base" : "text-lg"}`}>
          <Link href={`/produtos/${product.slug}`} className="hover:text-red">{product.name}</Link>
        </h2>
        <p className={`mt-2 flex-1 text-sm leading-6 text-ink/70 ${compact ? "line-clamp-1" : ""}`}>{product.shortDescription}</p>
        <div className={`flex items-end justify-between gap-2 border-t border-navy/10 ${compact ? "mt-3 pt-3" : "mt-4 pt-4"}`}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">Preço de referência</p>
            <p className={`mt-0.5 font-heading font-bold text-ink ${compact ? "text-xl" : "text-2xl"}`}>{formatCurrency(product.priceCents)}</p>
          </div>
          <span className="pb-1 text-xs font-semibold text-ink/55">{product.unit}</span>
        </div>
        <div className={`flex items-center gap-2 ${compact ? "mt-3" : "mt-4"}`}>
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
