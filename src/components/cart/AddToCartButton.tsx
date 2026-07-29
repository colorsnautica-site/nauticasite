"use client";

import { ShoppingCart } from "lucide-react";
import type { Product } from "@/data/catalog";
import { useCart } from "@/components/cart/CartContext";

export function AddToCartButton({ product }: { product: Product }) {
  const { addProduct, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={() => {
        addProduct(product, 1);
        openCart();
      }}
      aria-label={`Adicionar ${product.name} ao carrinho`}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-red text-sm font-semibold text-white transition hover:bg-red-bright"
    >
      <ShoppingCart size={18} aria-hidden="true" /> Adicionar ao carrinho
    </button>
  );
}
