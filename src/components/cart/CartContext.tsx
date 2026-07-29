"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import type { Product } from "@/data/catalog";
import {
  addItem,
  cartItemCount,
  cartTotalCents,
  clearCart,
  removeItem,
  setQuantity,
  type CartItem,
  type CartState
} from "@/lib/cart";

const STORAGE_KEY = "nautica-cart-v1";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalCents: number;
  whatsappNumber: string;
  isOpen: boolean;
  addProduct: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeProduct: (productId: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  closeProductModal: (() => void) | null;
  setProductModalCloser: (closer: (() => void) | null) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

type Action =
  | { type: "add"; product: Product; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "setQuantity"; productId: string; quantity: number }
  | { type: "clear" }
  | { type: "hydrate"; state: CartState };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "add":
      return addItem(state, action.product, action.quantity);
    case "remove":
      return removeItem(state, action.productId);
    case "setQuantity":
      return setQuantity(state, action.productId, action.quantity);
    case "clear":
      return clearCart();
    case "hydrate":
      return action.state;
    default:
      return state;
  }
}

export function CartProvider({ children, whatsappNumber }: { children: ReactNode; whatsappNumber: string }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [productModalCloser, setProductModalCloserState] = useState<{ close: (() => void) | null }>({ close: null });
  // Referencia estavel: se recriada a cada render, o useEffect que a chama
  // em InterceptedModalCloser (deps: [setProductModalCloser]) dispara de
  // novo a cada atualizacao de productModalCloser, causando loop infinito.
  const setProductModalCloser = useCallback((closer: (() => void) | null) => {
    setProductModalCloserState({ close: closer });
  }, []);

  // Le o carrinho salvo so depois de montar no navegador, pra nao divergir
  // do HTML renderizado no servidor (que sempre comeca vazio).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", state: JSON.parse(raw) as CartState });
    } catch {
      // localStorage indisponivel (ex: navegacao privada) — carrinho fica so em memoria.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // idem
    }
  }, [state]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount: cartItemCount(state),
      totalCents: cartTotalCents(state),
      whatsappNumber,
      isOpen,
      addProduct: (product, quantity = 1) => dispatch({ type: "add", product, quantity }),
      updateQuantity: (productId, quantity) => dispatch({ type: "setQuantity", productId, quantity }),
      removeProduct: (productId) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" }),
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      closeProductModal: productModalCloser.close,
      setProductModalCloser
    }),
    [state, whatsappNumber, isOpen, productModalCloser, setProductModalCloser]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa ser usado dentro de <CartProvider>");
  return ctx;
}
