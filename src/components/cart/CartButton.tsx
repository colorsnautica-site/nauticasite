"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { CartModal } from "@/components/cart/CartModal";

export function CartButton() {
  const { itemCount, isOpen, openCart, closeCart } = useCart();

  return (
    <>
      <button
        type="button"
        onClick={openCart}
        aria-label={itemCount > 0 ? `Abrir carrinho (${itemCount} ${itemCount === 1 ? "item" : "itens"})` : "Abrir carrinho"}
        className="fixed bottom-24 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-navy text-white shadow-lg transition hover:scale-110 hover:bg-navy/90 sm:bottom-28"
      >
        <ShoppingCart className="h-6 w-6" aria-hidden="true" />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-red px-1 text-xs font-bold text-white">
            {itemCount}
          </span>
        )}
      </button>
      {isOpen && <CartModal onClose={closeCart} />}
    </>
  );
}
