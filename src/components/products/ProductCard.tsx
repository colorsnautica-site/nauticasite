/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { formatPriceLabel, isOnRequestPrice } from "@/lib/currency";
import type { Product } from "@/data/catalog";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  const stockLabel = product.stockStatus === "available" ? "Disponível" : "Sob consulta";
  const detailHref = `/produtos/${product.categorySlug}/${product.sku}`;

  return (
    <article className="group flex h-full flex-col rounded-[28px] bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link
        href={detailHref}
        aria-label={`Ver detalhes de ${product.name}`}
        className="relative block aspect-[3/2] overflow-hidden rounded-3xl bg-sky transition group-hover:bg-mist"
      >
        <span className="absolute right-3 top-3 z-10 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-navy shadow-sm">
          {stockLabel}
        </span>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 ease-nautica group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full place-items-center px-4 text-center text-sm font-semibold text-navy/45">Imagem em breve</span>
        )}
      </Link>
      <div className="mt-3 flex flex-1 flex-col px-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {product.brandName ? (
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-red">{product.brandName}</span>
          ) : null}
        </div>
        <Link href={detailHref} className="mt-1.5 block">
          <h3 className="line-clamp-2 font-heading text-base font-bold leading-tight text-navy">{product.name}</h3>
        </Link>
        <div className="mt-3 flex flex-1 items-end justify-between gap-2 border-t border-navy/10 pt-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">
              {isOnRequestPrice(product.priceCents) ? "Preço" : "Preço de referência"}
            </p>
            <p className="mt-0.5 font-heading text-xl font-bold text-ink">{formatPriceLabel(product.priceCents)}</p>
          </div>
          <span className="pb-1 text-xs font-semibold text-ink/55">{product.unit}</span>
        </div>
        <div className="mt-3">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
