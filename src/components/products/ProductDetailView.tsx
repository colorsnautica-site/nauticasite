/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Product } from "@/data/catalog";
import { formatPriceLabel, isOnRequestPrice } from "@/lib/currency";
import { useCart } from "@/components/cart/CartContext";

export function ProductDetailView({ product }: { product: Product }) {
  const { addProduct, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const stockLabel = product.stockStatus === "available" ? "Disponível" : "Sob consulta";

  return (
    <div>
      <span className="inline-block rounded-full bg-navy/5 px-2.5 py-1 text-[11px] font-semibold text-navy">
        {stockLabel}
      </span>

      <div className="mt-4 aspect-[3/2] overflow-hidden rounded-3xl bg-sky">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full place-items-center px-4 text-center text-sm font-semibold text-navy/45">
            Imagem em breve
          </span>
        )}
      </div>

      {product.brandName ? (
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-red">{product.brandName}</p>
      ) : null}
      <h1 id="product-detail-title" className="mt-1.5 font-heading text-2xl font-bold leading-tight text-navy">
        {product.name}
      </h1>
      <p className="mt-1 text-xs text-ink/45">Código: {product.sku}</p>

      <div className="mt-4 flex items-end justify-between gap-2 border-t border-navy/10 pt-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">
            {isOnRequestPrice(product.priceCents) ? "Preço" : "Preço de referência"}
          </p>
          <p className="mt-0.5 font-heading text-2xl font-bold text-ink">{formatPriceLabel(product.priceCents)}</p>
        </div>
        <span className="pb-1 text-xs font-semibold text-ink/55">{product.unit}</span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          aria-label="Diminuir quantidade"
          className="grid h-9 w-9 place-items-center rounded-full bg-navy/5 text-navy hover:bg-navy/10"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center text-base font-semibold">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((current) => current + 1)}
          aria-label="Aumentar quantidade"
          className="grid h-9 w-9 place-items-center rounded-full bg-navy/5 text-navy hover:bg-navy/10"
        >
          <Plus size={16} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          addProduct(product, quantity);
          openCart();
        }}
        className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-red text-sm font-semibold text-white transition hover:bg-red-bright"
      >
        Adicionar ao carrinho
      </button>
    </div>
  );
}
