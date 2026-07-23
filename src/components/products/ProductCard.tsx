/* eslint-disable @next/next/no-img-element */
import { formatPriceLabel, isOnRequestPrice } from "@/lib/currency";
import type { Product } from "@/data/catalog";
import { WhatsappIcon } from "@/components/WhatsappIcon";

/**
 * Cartão de produto da landing. Diferente do e-commerce, NÃO tem carrinho nem
 * página de detalhe: a única ação é "Falar no WhatsApp", já com a mensagem do
 * produto preenchida para o atendimento.
 */
export function ProductCard({
  product,
  whatsappUrl
}: {
  product: Product;
  whatsappUrl: string;
}) {
  const stockLabel = product.stockStatus === "available" ? "Disponível" : "Sob consulta";

  return (
    <article className="group flex h-full flex-col rounded-[28px] border border-navy/10 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:border-red/20 hover:shadow-soft">
      <div className="relative aspect-[3/2] overflow-hidden rounded-3xl bg-sky transition group-hover:bg-mist">
        <span className="absolute right-3 top-3 z-10 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-navy shadow-sm">
          {stockLabel}
        </span>
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 ease-nautica group-hover:scale-105"
        />
      </div>
      <div className="mt-3 flex flex-1 flex-col px-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {product.brandName ? (
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-red">{product.brandName}</span>
          ) : null}
        </div>
        <h3 className="mt-1.5 line-clamp-2 font-heading text-base font-bold leading-tight text-navy">{product.name}</h3>
        <div className="mt-3 flex flex-1 items-end justify-between gap-2 border-t border-navy/10 pt-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">
              {isOnRequestPrice(product.priceCents) ? "Preço" : "Preço de referência"}
            </p>
            <p className="mt-0.5 font-heading text-xl font-bold text-ink">{formatPriceLabel(product.priceCents)}</p>
          </div>
          <span className="pb-1 text-xs font-semibold text-ink/55">{product.unit}</span>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Falar no WhatsApp sobre ${product.name}`}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-red text-sm font-semibold text-white transition hover:bg-red-bright"
        >
          <WhatsappIcon className="h-[18px] w-[18px]" /> Falar no WhatsApp
        </a>
      </div>
    </article>
  );
}
