# Carrinho de compras com finalização via WhatsApp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cliente monta um carrinho navegando pelo catálogo público e finaliza tudo numa única mensagem de WhatsApp; cada produto também ganha uma página/modal de detalhe própria (hoje inexistente).

**Architecture:** Carrinho = Context do React + `localStorage`, sem rota própria (sacola temporária, não é conteúdo navegável). Detalhe de produto = rota real `/produtos/[categoria]/[sku]`, interceptada como modal ao navegar dentro do site (Next.js *intercepting routes*), funcionando como página cheia se acessada direto. Ambos usam um componente `<Modal>` novo e compartilhado. Nenhuma mudança de schema/banco.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind, `lucide-react` (ícones, já é dependência), Vitest, Playwright.

## Global Constraints

- Sem dependências novas — usar só o que já está em `package.json`.
- Sem mudança de schema/banco de dados.
- Não tocar em código do painel `/admin` (o modal duplicado de lá é um problema separado, documentado na auditoria — fora de escopo aqui).
- Todo texto voltado ao cliente em português, no mesmo tom já usado em `src/lib/whatsapp.ts` (mensagens de WhatsApp) e nos componentes públicos existentes.
- Seguir as classes/tokens visuais já usados no site: `bg-navy`, `bg-red`/`bg-red-bright`, `rounded-full`, `font-heading`, `text-ink/NN` para opacidade de texto.
- Cada item do carrinho guarda uma cópia (snapshot) dos dados do produto no momento em que foi adicionado — não relê o catálogo depois.

---

### Task 1: Lógica pura do carrinho (`src/lib/cart.ts`)

**Files:**
- Create: `src/lib/cart.ts`
- Test: `src/lib/cart.test.ts`

**Interfaces:**
- Consumes: `Product` de `@/data/catalog` (campos: `id: string`, `sku: string`, `name: string`, `categorySlug: string`, `brandName: string`, `priceCents: number`, `unit: string`, `imageUrl: string`); `formatPriceLabel(cents: number): string` de `@/lib/currency`.
- Produces (usado pelas Tasks 3, 4, 6):
  - `type CartItem = { productId: string; sku: string; name: string; brandName: string; categorySlug: string; priceCents: number; imageUrl: string; unit: string; quantity: number }`
  - `type CartState = { items: CartItem[] }`
  - `function addItem(state: CartState, product: Product, quantity?: number): CartState` (default `quantity = 1`; se já existir item com o mesmo `productId`, soma a quantidade)
  - `function removeItem(state: CartState, productId: string): CartState`
  - `function setQuantity(state: CartState, productId: string, quantity: number): CartState` (quantidade nunca fica abaixo de 1 — para remover de vez, usar `removeItem`)
  - `function clearCart(): CartState`
  - `function cartItemCount(state: CartState): number` (soma das quantidades)
  - `function cartTotalCents(state: CartState): number` (soma só dos itens com `priceCents > 0`)
  - `function buildCartMessage(items: CartItem[]): string`

- [ ] **Step 1: Write the failing test**

Create `src/lib/cart.test.ts`:

```ts
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
    expect(message).toContain("R$ 320,00");
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
    expect(message).toContain("Total de referência: R$ 320,00");
  });

  it("retorna uma mensagem genérica para carrinho vazio", () => {
    expect(buildCartMessage([])).toContain("ainda estou escolhendo");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/cart.test.ts`
Expected: FAIL — `Cannot find module './cart'` (arquivo ainda não existe).

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/cart.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/cart.test.ts`
Expected: PASS (13 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/cart.ts src/lib/cart.test.ts
git commit -m "feat(carrinho): logica pura do carrinho e mensagem de WhatsApp"
```

---

### Task 2: Componente visual `<Modal>` compartilhado

**Files:**
- Create: `src/components/ui/Modal.tsx`

**Interfaces:**
- Consumes: nada de outras tasks.
- Produces (usado pelas Tasks 4 e 7): `function Modal({ onClose, children, labelledBy }: { onClose: () => void; children: React.ReactNode; labelledBy?: string }): React.ReactPortal | null` — overlay em tela cheia, fecha com Esc, clique fora, ou o botão "×"; trava o scroll do `body` enquanto aberto; prende o foco (Tab) dentro do modal.

Não tem lógica de negócio pra testar isoladamente (é só apresentação/interação de teclado) — a verificação é manual, feita na Task 9 quando o modal já estiver integrado numa tela real.

- [ ] **Step 1: Implementar**

Create `src/components/ui/Modal.tsx`:

```tsx
"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

export function Modal({
  onClose,
  children,
  labelledBy
}: {
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#343342]/60 p-3 backdrop-blur-sm sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-navy/5 text-lg text-navy transition hover:bg-navy/10"
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
```

Nota: o `mounted`/`useState` evita renderizar `createPortal` no servidor (onde `document` não existe) — o modal só aparece depois que o componente montou no navegador.

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros novos relacionados a `Modal.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Modal.tsx
git commit -m "feat(carrinho): componente Modal compartilhado para o site publico"
```

---

### Task 3: `CartContext` — estado do carrinho + persistência

**Files:**
- Create: `src/components/cart/CartContext.tsx`

**Interfaces:**
- Consumes: tudo de `src/lib/cart.ts` (Task 1) — `CartItem`, `CartState`, `addItem`, `removeItem`, `setQuantity`, `clearCart`, `cartItemCount`, `cartTotalCents`. `Product` de `@/data/catalog`.
- Produces (usado pelas Tasks 4 e 6):
  - `function CartProvider({ children, whatsappNumber }: { children: React.ReactNode; whatsappNumber: string }): JSX.Element`
  - `function useCart(): { items: CartItem[]; itemCount: number; totalCents: number; whatsappNumber: string; isOpen: boolean; addProduct: (product: Product, quantity?: number) => void; updateQuantity: (productId: string, quantity: number) => void; removeProduct: (productId: string) => void; clear: () => void; openCart: () => void; closeCart: () => void }` — lança erro se usado fora de um `<CartProvider>`.

- [ ] **Step 1: Implementar**

Create `src/components/cart/CartContext.tsx`:

```tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
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
      closeCart: () => setIsOpen(false)
    }),
    [state, whatsappNumber, isOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa ser usado dentro de <CartProvider>");
  return ctx;
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros novos relacionados a `CartContext.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/cart/CartContext.tsx
git commit -m "feat(carrinho): CartProvider com persistencia em localStorage"
```

---

### Task 4: `CartModal` e `CartButton`

**Files:**
- Create: `src/components/cart/CartModal.tsx`
- Create: `src/components/cart/CartButton.tsx`

**Interfaces:**
- Consumes: `useCart()` (Task 3); `Modal` (Task 2); `formatCurrency`, `formatPriceLabel` de `@/lib/currency`; `buildCartMessage` de `@/lib/cart` (Task 1); `whatsappUrl` de `@/lib/whatsapp` (assinatura existente: `whatsappUrl(message: string, number?: string): string`); ícones `ShoppingCart`, `Minus`, `Plus`, `Trash2` de `lucide-react`.
- Produces (usado pela Task 8): `function CartButton(): JSX.Element` — ícone flutuante com contador; abre/fecha o `CartModal` internamente via `useCart()`.

- [ ] **Step 1: Implementar `CartModal`**

Create `src/components/cart/CartModal.tsx`:

```tsx
/* eslint-disable @next/next/no-img-element */
"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { buildCartMessage } from "@/lib/cart";
import { formatCurrency, formatPriceLabel } from "@/lib/currency";
import { whatsappUrl } from "@/lib/whatsapp";
import { Modal } from "@/components/ui/Modal";
import { useCart } from "@/components/cart/CartContext";

export function CartModal({ onClose }: { onClose: () => void }) {
  const { items, totalCents, whatsappNumber, updateQuantity, removeProduct, clear } = useCart();
  const checkoutUrl = whatsappUrl(buildCartMessage(items), whatsappNumber);

  return (
    <Modal onClose={onClose} labelledBy="cart-modal-title">
      <h2 id="cart-modal-title" className="font-heading text-xl font-bold text-navy">
        Seu carrinho
      </h2>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-ink/60">
          Seu carrinho está vazio. Adicione produtos no catálogo para montar seu pedido.
        </p>
      ) : (
        <>
          <ul className="mt-4 flex max-h-[50vh] flex-col gap-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3 border-b border-navy/10 pb-3">
                <div className="h-16 w-16 flex-none overflow-hidden rounded-xl bg-sky">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="line-clamp-2 text-sm font-semibold text-navy">{item.name}</p>
                  <p className="text-xs text-ink/55">{formatPriceLabel(item.priceCents)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label={`Diminuir quantidade de ${item.name}`}
                      className="grid h-7 w-7 place-items-center rounded-full bg-navy/5 text-navy hover:bg-navy/10"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label={`Aumentar quantidade de ${item.name}`}
                      className="grid h-7 w-7 place-items-center rounded-full bg-navy/5 text-navy hover:bg-navy/10"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProduct(item.productId)}
                      aria-label={`Remover ${item.name} do carrinho`}
                      className="ml-auto grid h-7 w-7 place-items-center rounded-full text-red hover:bg-red/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-ink/60">Total de referência</span>
            <span className="font-heading text-lg font-bold text-navy">{formatCurrency(totalCents)}</span>
          </div>
          <p className="mt-1 text-xs text-ink/45">Itens &quot;Sob consulta&quot; não entram nesta soma.</p>

          <div className="mt-6 flex flex-col gap-2">
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex h-11 w-full items-center justify-center rounded-full bg-red text-sm font-semibold text-white transition hover:bg-red-bright"
            >
              Finalizar no WhatsApp
            </a>
            <button
              type="button"
              onClick={clear}
              className="text-xs font-semibold text-ink/50 underline-offset-2 hover:text-red hover:underline"
            >
              Esvaziar carrinho
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
```

- [ ] **Step 2: Implementar `CartButton`**

Create `src/components/cart/CartButton.tsx`:

```tsx
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
```

O botão fica em `bottom-24`/`sm:bottom-28` — empilhado acima do ícone flutuante de WhatsApp já existente (`bottom-4`/`sm:bottom-6`, `h-14`), sem sobrepor.

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros novos.

- [ ] **Step 4: Commit**

```bash
git add src/components/cart/CartModal.tsx src/components/cart/CartButton.tsx
git commit -m "feat(carrinho): modal de revisao do carrinho e botao flutuante"
```

---

### Task 5: Buscar um produto por SKU (para as páginas de detalhe)

**Files:**
- Modify: `src/db/queries/products.ts`
- Modify: `src/data/catalog.ts`

**Interfaces:**
- Consumes: `getProductsByCategoryDb` (já existe em `src/db/queries/products.ts`).
- Produces (usado pela Task 7):
  - `async function getProductBySkuDb(categorySlug: string, identifier: string): Promise<Product | undefined>` em `src/db/queries/products.ts`
  - `async function getProductBySku(categorySlug: string, identifier: string): Promise<Product | undefined>` em `src/data/catalog.ts` (repassa pra `getProductBySkuDb`)
  - Busca primeiro por `sku === identifier`; se não achar, tenta por `id === identifier` (fallback defensivo para o caso raro de produto sem SKU).

- [ ] **Step 1: Adicionar a query**

Modify `src/db/queries/products.ts` — adicionar ao final do arquivo:

```ts
export async function getProductBySkuDb(categorySlug: string, identifier: string): Promise<Product | undefined> {
  const rows = await getProductsByCategoryDb(categorySlug);
  return rows.find((product) => product.sku === identifier) ?? rows.find((product) => product.id === identifier);
}
```

- [ ] **Step 2: Expor via `catalog.ts`**

Modify `src/data/catalog.ts` — trocar a linha do import (linha 10) de:

```ts
import { getAllProductsDb, getProductsByCategoryDb } from "@/db/queries/products";
```

para:

```ts
import { getAllProductsDb, getProductBySkuDb, getProductsByCategoryDb } from "@/db/queries/products";
```

E adicionar, logo depois de `getProductsByCategory` (depois da linha 50):

```ts
export async function getProductBySku(categorySlug: string, identifier: string): Promise<Product | undefined> {
  return getProductBySkuDb(categorySlug, identifier);
}
```

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros novos.

- [ ] **Step 4: Commit**

```bash
git add src/db/queries/products.ts src/data/catalog.ts
git commit -m "feat(produtos): busca de produto por sku para pagina de detalhe"
```

---

### Task 6: `ProductDetailView` e `AddToCartButton`

**Files:**
- Create: `src/components/products/ProductDetailView.tsx`
- Create: `src/components/cart/AddToCartButton.tsx`

**Interfaces:**
- Consumes: `Product` de `@/data/catalog`; `formatPriceLabel`, `isOnRequestPrice` de `@/lib/currency`; `useCart()` (Task 3).
- Produces (usado pelas Tasks 7 e 9):
  - `function ProductDetailView({ product }: { product: Product }): JSX.Element` — título do produto tem `id="product-detail-title"`.
  - `function AddToCartButton({ product }: { product: Product }): JSX.Element` — botão "Adicionar ao carrinho" que adiciona 1 unidade e abre o carrinho.

- [ ] **Step 1: Implementar `AddToCartButton`**

Create `src/components/cart/AddToCartButton.tsx`:

```tsx
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
```

- [ ] **Step 2: Implementar `ProductDetailView`**

Create `src/components/products/ProductDetailView.tsx`:

```tsx
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
```

`ProductDetailView` já tem seu próprio botão de adicionar (com seletor de quantidade) — não usa o `AddToCartButton` da Task anterior; esse fica só para o card da grade (Task 9), que não tem seletor de quantidade (sempre adiciona 1).

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros novos.

- [ ] **Step 4: Commit**

```bash
git add src/components/cart/AddToCartButton.tsx src/components/products/ProductDetailView.tsx
git commit -m "feat(carrinho): view de detalhe do produto e botao de adicionar rapido"
```

---

### Task 7: Rotas de detalhe do produto (página cheia + modal interceptado)

**Files:**
- Create: `src/app/produtos/[categoria]/[sku]/page.tsx`
- Create: `src/components/products/InterceptedModalCloser.tsx`
- Create: `src/app/@modal/default.tsx`
- Create: `src/app/@modal/(...)produtos/[categoria]/[sku]/page.tsx`

**Interfaces:**
- Consumes: `getCategoryBySlug`, `getProductBySku` de `@/data/catalog` (Task 5); `ProductDetailView` (Task 6); `Modal` (Task 2); `Eyebrow` de `@/components/Eyebrow` (já existe, usado em `src/app/produtos/[categoria]/page.tsx`).
- Produces: as duas rotas ficam prontas para a Task 9 (que vai linkar pra elas a partir do `ProductCard`). `InterceptedModalCloser({ children, labelledBy }: { children: React.ReactNode; labelledBy?: string })` fica disponível caso outra rota interceptada precise do mesmo padrão no futuro.

- [ ] **Step 1: Página cheia (fallback / link direto / SEO)**

Create `src/app/produtos/[categoria]/[sku]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/Eyebrow";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import { getCategoryBySlug, getProductBySku } from "@/data/catalog";

export async function generateMetadata({
  params
}: {
  params: Promise<{ categoria: string; sku: string }>;
}): Promise<Metadata> {
  const { categoria, sku } = await params;
  const category = getCategoryBySlug(categoria);
  if (!category) return {};
  const product = await getProductBySku(categoria, sku);
  if (!product) return {};
  return {
    title: `${product.name} | Náutica Color`,
    description: `${product.name}${product.brandName ? ` (${product.brandName})` : ""} — ${category.name} na Náutica Color.`
  };
}

export default async function ProdutoDetalhePage({
  params
}: {
  params: Promise<{ categoria: string; sku: string }>;
}) {
  const { categoria, sku } = await params;
  const category = getCategoryBySlug(categoria);
  if (!category) notFound();

  const product = await getProductBySku(categoria, sku);
  if (!product) notFound();

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <Eyebrow>{category.name}</Eyebrow>
        <div className="mt-6">
          <ProductDetailView product={product} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wrapper client para fechar o modal interceptado**

Create `src/components/products/InterceptedModalCloser.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";

export function InterceptedModalCloser({
  children,
  labelledBy
}: {
  children: React.ReactNode;
  labelledBy?: string;
}) {
  const router = useRouter();
  return (
    <Modal onClose={() => router.back()} labelledBy={labelledBy}>
      {children}
    </Modal>
  );
}
```

- [ ] **Step 3: Slot `@modal` — versão vazia por padrão**

Create `src/app/@modal/default.tsx`:

```tsx
export default function Default() {
  return null;
}
```

- [ ] **Step 4: Versão interceptada (abre como modal)**

Create `src/app/@modal/(...)produtos/[categoria]/[sku]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductBySku } from "@/data/catalog";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import { InterceptedModalCloser } from "@/components/products/InterceptedModalCloser";

export default async function ProdutoModalPage({
  params
}: {
  params: Promise<{ categoria: string; sku: string }>;
}) {
  const { categoria, sku } = await params;
  const category = getCategoryBySlug(categoria);
  if (!category) notFound();

  const product = await getProductBySku(categoria, sku);
  if (!product) notFound();

  return (
    <InterceptedModalCloser labelledBy="product-detail-title">
      <ProductDetailView product={product} />
    </InterceptedModalCloser>
  );
}
```

`(...)` intercepta a partir da raiz do app (`src/app/`), então funciona navegando tanto da home quanto de `/produtos/[categoria]`.

- [ ] **Step 5: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros novos. (O slot `modal` só passa a ser aceito pelo `layout.tsx` raiz na Task 8 — normal ainda não ter erro aqui, já que essa rota não é referenciada por ninguém até lá.)

- [ ] **Step 6: Commit**

```bash
git add src/app/produtos/[categoria]/[sku]/page.tsx src/components/products/InterceptedModalCloser.tsx src/app/@modal
git commit -m "feat(produtos): pagina de detalhe do produto (cheia + modal interceptado)"
```

---

### Task 8: Ligar `CartProvider`, `CartButton` e o slot `@modal` no layout raiz

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `CartProvider` (Task 3), `CartButton` (Task 4), `getSiteContent` de `@/db/queries/content` (já existe, usado em `src/app/produtos/layout.tsx`), `resolveWhatsappNumber` de `@/lib/whatsapp` (já existe).
- Produces: carrinho e slot de modal disponíveis em **todo** o site (home + `/produtos/**`), consumido implicitamente pela Task 9 (que passa a usar `useCart()` dentro do `ProductCard`).

- [ ] **Step 1: Atualizar o layout raiz**

Modify `src/app/layout.tsx` — trocar o arquivo inteiro por:

```tsx
import type { Metadata } from "next";
import { Fraunces, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartButton } from "@/components/cart/CartButton";
import { CartProvider } from "@/components/cart/CartContext";
import { getSiteContent } from "@/db/queries/content";
import { resolveWhatsappNumber } from "@/lib/whatsapp";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", weight: ["400", "500", "600", "700"], display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });

export const metadata: Metadata = {
  title: "Náutica Color | Produtos para a sua embarcação",
  description:
    "Tintas, antifouling, acabamentos e abrasivos de alta performance. Fale com o atendimento pelo WhatsApp e encontre o produto certo para a sua embarcação.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" }
    ],
    apple: "/favicon.png"
  }
};

export default async function RootLayout({
  children,
  modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const content = await getSiteContent();
  const whatsappNumber = resolveWhatsappNumber(content.whatsapp_1);

  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable} ${fraunces.variable}`}>
      <body className="antialiased">
        <CartProvider whatsappNumber={whatsappNumber}>
          {children}
          {modal}
          <CartButton />
        </CartProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Rodar o site localmente e conferir**

Run: `npm run dev`

Abrir `http://localhost:3000/` (ou a porta que o terminal indicar) e confirmar:
- A home carrega normalmente, sem erro no console.
- O ícone flutuante do carrinho aparece no canto inferior direito, acima do ícone de WhatsApp, mostrando nenhum contador (carrinho vazio).

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros novos.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(carrinho): integra CartProvider, botao flutuante e slot de modal no layout raiz"
```

---

### Task 9: Atualizar `ProductCard` e remover a rota antiga de WhatsApp por produto

**Files:**
- Modify: `src/components/products/ProductCard.tsx`
- Modify: `src/components/products/ProductGrid.tsx`
- Modify: `src/components/products/FeaturedCategories.tsx`
- Modify: `src/app/produtos/page.tsx`
- Modify: `src/app/produtos/[categoria]/page.tsx`
- Modify: `src/lib/whatsapp.ts`

**Interfaces:**
- Consumes: `AddToCartButton` (Task 6); detalhe do produto vive em `/produtos/[categoria]/[sku]` (Task 7).
- Produces: nenhuma outra task depende deste — é o último passo de integração visual.

- [ ] **Step 1: Reescrever `ProductCard`**

Modify `src/components/products/ProductCard.tsx` — substituir o arquivo inteiro por:

```tsx
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
```

Note que `<Link>` e `<button>` (dentro de `AddToCartButton`) ficam **irmãos**, nunca um dentro do outro — evita aninhar elementos interativos, o que é inválido em HTML e confunde leitor de tela.

- [ ] **Step 2: Simplificar `ProductGrid`**

Modify `src/components/products/ProductGrid.tsx` — substituir o arquivo inteiro por:

```tsx
import type { Product } from "@/data/catalog";
import { ProductCard } from "@/components/products/ProductCard";

export function ProductGrid({
  products,
  emptyMessage = "Nenhum produto encontrado nesta categoria."
}: {
  products: Product[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return <p className="py-12 text-center text-sm text-ink/60">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Atualizar `FeaturedCategories`**

Modify `src/components/products/FeaturedCategories.tsx`:

Trocar a linha 22:

```tsx
export function FeaturedCategories({ groups, whatsappNumber }: { groups: FeaturedGroup[]; whatsappNumber?: string }) {
```

por:

```tsx
export function FeaturedCategories({ groups }: { groups: FeaturedGroup[] }) {
```

E trocar a linha 46:

```tsx
        <ProductGrid products={active.products} whatsappNumber={whatsappNumber} />
```

por:

```tsx
        <ProductGrid products={active.products} />
```

- [ ] **Step 4: Atualizar `src/app/page.tsx`**

Modify `src/app/page.tsx` — trocar a linha 136 de:

```tsx
              <FeaturedCategories groups={featuredGroups} whatsappNumber={whatsappNumber} />
```

por:

```tsx
              <FeaturedCategories groups={featuredGroups} />
```

(As variáveis `whatsappNumber`/`whatsappNumber2` continuam existindo nesse arquivo — ainda são usadas pelos links de "Falar com o atendimento" e de contato, só não são mais passadas pro `FeaturedCategories`.)

- [ ] **Step 5: Atualizar `src/app/produtos/page.tsx`**

Modify `src/app/produtos/page.tsx`:

Trocar a linha 23:

```tsx
  const [all, content] = await Promise.all([getAllProducts(), getSiteContent()]);
```

por:

```tsx
  const all = await getAllProducts();
```

Trocar as linhas 50–54 de:

```tsx
          <ProductGrid
            products={items}
            whatsappNumber={resolveWhatsappNumber(content.whatsapp_1)}
            emptyMessage={query ? "Nenhum produto encontrado para essa busca." : undefined}
          />
```

por:

```tsx
          <ProductGrid
            products={items}
            emptyMessage={query ? "Nenhum produto encontrado para essa busca." : undefined}
          />
```

E remover os imports que ficaram sem uso (linhas 8–9):

```tsx
import { getSiteContent } from "@/db/queries/content";
import { resolveWhatsappNumber } from "@/lib/whatsapp";
```

- [ ] **Step 6: Atualizar `src/app/produtos/[categoria]/page.tsx`**

Modify `src/app/produtos/[categoria]/page.tsx`:

Trocar a linha 44:

```tsx
  const [products, content] = await Promise.all([getProductsByCategory(categoria), getSiteContent()]);
```

por:

```tsx
  const products = await getProductsByCategory(categoria);
```

Trocar a linha 67:

```tsx
          <ProductGrid products={items} whatsappNumber={resolveWhatsappNumber(content.whatsapp_1)} />
```

por:

```tsx
          <ProductGrid products={items} />
```

E remover os imports que ficaram sem uso (linhas 10–11):

```tsx
import { getSiteContent } from "@/db/queries/content";
import { resolveWhatsappNumber } from "@/lib/whatsapp";
```

- [ ] **Step 7: Remover código morto de `src/lib/whatsapp.ts`**

Modify `src/lib/whatsapp.ts` — substituir o arquivo inteiro por (remove `buildProductMessage`/`productWhatsappUrl`, que não têm mais nenhum uso depois dos passos acima, e o import de `Product`/`formatPriceLabel` que só existiam pra elas):

```ts
import { phoneToDigits } from "@/lib/phone";

// Número padrão; pode ser sobrescrito pela env NEXT_PUBLIC_WHATSAPP_NUMBER no
// projeto Vercel da landing.
const fallbackNumber = "5524998447844";

export function resolveWhatsappNumber(contentValue?: string) {
  return phoneToDigits(contentValue ?? "")
    ?? phoneToDigits(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "")
    ?? fallbackNumber;
}

export function buildSupportMessage() {
  return "Olá, equipe Náutica Color! Vi a página de produtos e gostaria de ajuda para escolher o item certo para a minha embarcação.";
}

export function whatsappUrl(message: string, number = fallbackNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 8: Verificar que compila e os testes existentes continuam passando**

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: `npx vitest run --exclude '**/*.integration.test.ts'`
Expected: todos os testes existentes continuam passando (nenhum deles testava `buildProductMessage`/`productWhatsappUrl`).

- [ ] **Step 9: Testar manualmente no navegador**

Run: `npm run dev`

Na home e em `/produtos`:
- Clicar na imagem ou no título de um produto abre o modal de detalhe (URL muda pra `/produtos/<categoria>/<sku>`, mas a página de trás continua visível).
- Dentro do modal: seletor de quantidade funciona, "Adicionar ao carrinho" adiciona e abre o carrinho.
- Recarregar a página com a URL de detalhe aberta (F5) mostra a página cheia (sem o catálogo atrás).
- No card da grade, clicar direto em "Adicionar ao carrinho" adiciona 1 unidade sem navegar.
- Ícone do carrinho mostra o contador certo; abrir carrinho mostra os itens; +/- muda quantidade; lixeira remove; "Finalizar no WhatsApp" abre uma nova aba com a mensagem certa.
- Recarregar a página inteira (F5) e confirmar que o carrinho continua com os itens (persistência).

- [ ] **Step 10: Commit**

```bash
git add src/components/products/ProductCard.tsx src/components/products/ProductGrid.tsx src/components/products/FeaturedCategories.tsx src/app/page.tsx src/app/produtos/page.tsx "src/app/produtos/[categoria]/page.tsx" src/lib/whatsapp.ts
git commit -m "feat(carrinho): substitui whatsapp por produto por adicionar-ao-carrinho"
```

---

### Task 10: Teste e2e do fluxo completo

**Files:**
- Create: `tests/e2e/carrinho.e2e.spec.ts`

**Interfaces:**
- Consumes: nenhuma API nova — só interage com a UI já construída nas tasks anteriores. Segue o padrão de `tests/e2e/admin.e2e.spec.ts` e `tests/e2e/global-setup.ts` já existentes no projeto.

- [ ] **Step 1: Escrever o teste**

Create `tests/e2e/carrinho.e2e.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test.describe("Carrinho de compras", () => {
  test("adicionar produto, revisar no carrinho e finalizar no WhatsApp", async ({ page, context }) => {
    await page.goto("/produtos");

    const firstCard = page.locator("article").first();
    const productName = await firstCard.locator("h3").innerText();

    await firstCard.getByRole("button", { name: /adicionar .* ao carrinho/i }).click();

    const cartButton = page.getByRole("button", { name: /abrir carrinho/i });
    await expect(cartButton).toContainText("1");

    await cartButton.click();
    const cartModal = page.getByRole("dialog", { name: "Seu carrinho" });
    await expect(cartModal).toBeVisible();
    await expect(cartModal).toContainText(productName);

    const [whatsappPage] = await Promise.all([
      context.waitForEvent("page"),
      cartModal.getByRole("link", { name: /finalizar no whatsapp/i }).click()
    ]);
    await whatsappPage.waitForLoadState("domcontentloaded");
    expect(whatsappPage.url()).toContain("wa.me");
    expect(decodeURIComponent(whatsappPage.url())).toContain(productName);
  });

  test("abrir detalhe do produto e ajustar quantidade antes de adicionar", async ({ page }) => {
    await page.goto("/produtos");

    const firstCard = page.locator("article").first();
    await firstCard.locator("h3").click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\/produtos\/[^/]+\/[^/]+$/);

    await dialog.getByRole("button", { name: "Aumentar quantidade" }).click();
    await expect(dialog.getByText("2", { exact: true })).toBeVisible();

    await dialog.getByRole("button", { name: /adicionar ao carrinho/i }).click();
    await expect(page.getByRole("button", { name: /abrir carrinho/i })).toContainText("2");
  });

  test("carrinho persiste depois de recarregar a página", async ({ page }) => {
    await page.goto("/produtos");
    await page.locator("article").first().getByRole("button", { name: /adicionar .* ao carrinho/i }).click();
    await expect(page.getByRole("button", { name: /abrir carrinho/i })).toContainText("1");

    await page.reload();
    await expect(page.getByRole("button", { name: /abrir carrinho/i })).toContainText("1");
  });
});
```

- [ ] **Step 2: Rodar o teste**

Run: `npm run test:e2e -- carrinho.e2e.spec.ts`
Expected: os 3 testes passam. (Precisa de `TEST_DATABASE_URL` configurado, igual aos testes e2e do admin — ver `tests/e2e/global-setup.ts`.)

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/carrinho.e2e.spec.ts
git commit -m "test(e2e): fluxo completo do carrinho de compras"
```

---

## Verificação final

- [ ] `npx tsc --noEmit` sem erros
- [ ] `npx vitest run --exclude '**/*.integration.test.ts'` — tudo passando
- [ ] `npm run test:e2e -- carrinho.e2e.spec.ts` — passando
- [ ] `npm run build` — build de produção sem erros (importante especialmente pra confirmar que a rota interceptada `@modal` compila certo)
- [ ] Teste manual: navegar do zero (home → produto → carrinho → WhatsApp) num navegador limpo
