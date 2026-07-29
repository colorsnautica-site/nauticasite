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
        <>
          <p className="mt-4 text-sm text-ink/60">
            Seu carrinho está vazio. Adicione produtos no catálogo para montar seu pedido.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 flex h-11 w-full items-center justify-center rounded-full border border-navy/15 text-sm font-semibold text-navy transition hover:bg-navy/5"
          >
            Continuar comprando
          </button>
        </>
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
              onClick={onClose}
              className="flex h-11 w-full items-center justify-center rounded-full border border-navy/15 text-sm font-semibold text-navy transition hover:bg-navy/5"
            >
              Continuar comprando
            </button>
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
