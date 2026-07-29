import { describe, expect, it } from "vitest";
import {
  addItem,
  buildCartMessage,
  cartItemCount,
  cartTotalCents,
  clearCart,
  removeItem,
  setQuantity,
  type CartState
} from "./cart";
import type { Product } from "@/data/catalog";
import { formatPriceLabel } from "@/lib/currency";

const productA: Product = {
  id: "1",
  sku: "SKU-A",
  name: "Tinta W Thane PU 50",
  categorySlug: "linha-nautica",
  brandName: "WEG",
  priceCents: 32000,
  unit: "UN",
  stockStatus: "available",
  imageUrl: "https://example.com/a.jpg"
};

const productB: Product = {
  id: "2",
  sku: "SKU-B",
  name: "Sikaflex 295 UV",
  categorySlug: "adesivos-e-selantes",
  brandName: "Sika",
  priceCents: 0,
  unit: "UN",
  stockStatus: "on_request",
  imageUrl: ""
};

describe("addItem", () => {
  it("adiciona um produto novo com a quantidade informada", () => {
    const state = addItem({ items: [] }, productA, 2);
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ productId: "1", sku: "SKU-A", quantity: 2 });
  });

  it("soma a quantidade se o produto já está no carrinho", () => {
    const first = addItem({ items: [] }, productA, 1);
    const second = addItem(first, productA, 3);
    expect(second.items).toHaveLength(1);
    expect(second.items[0].quantity).toBe(4);
  });

  it("usa quantidade 1 por padrão", () => {
    const state = addItem({ items: [] }, productA);
    expect(state.items[0].quantity).toBe(1);
  });
});

describe("removeItem", () => {
  it("remove o item pelo productId", () => {
    const state: CartState = { items: [{ productId: "1", sku: "SKU-A", name: "A", brandName: "", categorySlug: "x", priceCents: 100, imageUrl: "", unit: "UN", quantity: 1 }] };
    expect(removeItem(state, "1").items).toHaveLength(0);
  });
});

describe("setQuantity", () => {
  it("atualiza a quantidade do item", () => {
    const state = addItem({ items: [] }, productA, 1);
    const updated = setQuantity(state, "1", 5);
    expect(updated.items[0].quantity).toBe(5);
  });

  it("nunca deixa a quantidade abaixo de 1", () => {
    const state = addItem({ items: [] }, productA, 1);
    const updated = setQuantity(state, "1", 0);
    expect(updated.items[0].quantity).toBe(1);
  });
});

describe("clearCart", () => {
  it("retorna um carrinho vazio", () => {
    expect(clearCart()).toEqual({ items: [] });
  });
});

describe("cartItemCount", () => {
  it("soma as quantidades de todos os itens", () => {
    let state = addItem({ items: [] }, productA, 2);
    state = addItem(state, productB, 3);
    expect(cartItemCount(state)).toBe(5);
  });
});

describe("cartTotalCents", () => {
  it("soma só os itens com preço definido", () => {
    let state = addItem({ items: [] }, productA, 2); // 32000 * 2 = 64000
    state = addItem(state, productB, 3); // sob consulta, não entra na soma
    expect(cartTotalCents(state)).toBe(64000);
  });
});

describe("buildCartMessage", () => {
  it("lista nome, quantidade, código e preço de cada item", () => {
    const state = addItem({ items: [] }, productA, 2);
    const message = buildCartMessage(state.items);
    expect(message).toContain("2x Tinta W Thane PU 50 (WEG)");
    expect(message).toContain("Código: SKU-A");
    expect(message).toContain(formatPriceLabel(32000));
  });

  it("mostra 'Sob consulta' para item sem preço, sem quebrar a soma total", () => {
    const state = addItem({ items: [] }, productB, 1);
    const message = buildCartMessage(state.items);
    expect(message).toContain("Sob consulta");
    expect(message).not.toContain("Total de referência");
  });

  it("inclui o total só quando existe pelo menos um item com preço", () => {
    let state = addItem({ items: [] }, productA, 1);
    state = addItem(state, productB, 1);
    const message = buildCartMessage(state.items);
    expect(message).toContain(`Total de referência: ${formatPriceLabel(32000)}`);
  });

  it("retorna uma mensagem genérica para carrinho vazio", () => {
    expect(buildCartMessage([])).toContain("ainda estou escolhendo");
  });
});
