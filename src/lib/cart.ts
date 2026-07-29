import type { Product } from "@/data/catalog";
import { formatPriceLabel } from "@/lib/currency";

export type CartItem = {
  productId: string;
  sku: string;
  name: string;
  brandName: string;
  categorySlug: string;
  priceCents: number;
  imageUrl: string;
  unit: string;
  quantity: number;
};

export type CartState = { items: CartItem[] };

function snapshotFromProduct(product: Product, quantity: number): CartItem {
  return {
    productId: product.id,
    sku: product.sku,
    name: product.name,
    brandName: product.brandName,
    categorySlug: product.categorySlug,
    priceCents: product.priceCents,
    imageUrl: product.imageUrl,
    unit: product.unit,
    quantity
  };
}

export function addItem(state: CartState, product: Product, quantity = 1): CartState {
  const existing = state.items.find((item) => item.productId === product.id);
  if (!existing) {
    return { items: [...state.items, snapshotFromProduct(product, quantity)] };
  }
  return {
    items: state.items.map((item) =>
      item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item
    )
  };
}

export function removeItem(state: CartState, productId: string): CartState {
  return { items: state.items.filter((item) => item.productId !== productId) };
}

export function setQuantity(state: CartState, productId: string, quantity: number): CartState {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  return {
    items: state.items.map((item) =>
      item.productId === productId ? { ...item, quantity: safeQuantity } : item
    )
  };
}

export function clearCart(): CartState {
  return { items: [] };
}

export function cartItemCount(state: CartState): number {
  return state.items.reduce((sum, item) => sum + item.quantity, 0);
}

function sumPricedCents(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.priceCents > 0 ? item.priceCents * item.quantity : 0), 0);
}

export function cartTotalCents(state: CartState): number {
  return sumPricedCents(state.items);
}

export function buildCartMessage(items: CartItem[]): string {
  if (items.length === 0) {
    return "Olá, equipe Náutica Color! Gostaria de montar um pedido, ainda estou escolhendo os produtos.";
  }

  const lines = items.map((item) => {
    const brand = item.brandName ? ` (${item.brandName})` : "";
    return `• ${item.quantity}x ${item.name}${brand}\n  Código: ${item.sku} — Preço de referência: ${formatPriceLabel(item.priceCents)}`;
  });

  const totalCents = sumPricedCents(items);
  const totalLine = totalCents > 0
    ? `\n\nTotal de referência: ${formatPriceLabel(totalCents)} (não inclui itens "Sob consulta")`
    : "";

  return `Olá, equipe Náutica Color! Gostaria de finalizar o pedido destes itens:\n\n${lines.join("\n\n")}${totalLine}\n\nOs valores do site são apenas referência. Aguardo a confirmação pelo WhatsApp. Obrigado!`;
}
