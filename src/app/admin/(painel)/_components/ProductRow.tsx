"use client";

import { createPortal } from "react-dom";
import { useActionState, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Category, Product } from "@/data/catalog";
import { INITIAL_ACTION_RESULT } from "@/lib/action-result";
import { centsToReaisInput } from "@/lib/money";
import { deleteProductAction, updateProductAction } from "@/app/admin/(painel)/produtos/actions";
import { useDialogBehavior } from "@/hooks/useDialogBehavior";
import { ActionFeedback, FieldError } from "./ActionFeedback";
import { ImageUploader } from "./ImageUploader";

const fieldClassName =
  "mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-navy/40 focus:ring-4 focus:ring-navy/5";

// Mesma curva usada no restante do site (tailwind.config.ts: transitionTimingFunction.nautica).
const NAUTICA_EASE = [0.16, 1, 0.3, 1] as const;

function ProductEditDialog({
  product,
  categories,
  titleId,
  onClosed,
  triggerRef
}: {
  product: Product;
  categories: Category[];
  titleId: string;
  onClosed: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const [updateResult, updateAction, updating] = useActionState(updateProductAction, INITIAL_ACTION_RESULT);
  const [deleteResult, deleteAction, deleting] = useActionState(deleteProductAction, INITIAL_ACTION_RESULT);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [visible, setVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const requestClose = () => setVisible(false);
  const { closeButtonRef, containerRef } = useDialogBehavior<HTMLElement>(requestClose);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#343342]/60 p-3 backdrop-blur-sm sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: NAUTICA_EASE }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <motion.section
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={visible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.32, ease: NAUTICA_EASE }}
        onAnimationComplete={() => {
          if (!visible) {
            onClosed();
            requestAnimationFrame(() => triggerRef.current?.focus());
          }
        }}
        className="my-auto max-h-[calc(100vh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-[#fcfcfd] shadow-[0_28px_90px_rgba(25,26,38,0.32)] sm:max-h-[calc(100vh-3rem)]"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-navy/10 bg-[#fcfcfd]/95 px-5 py-5 backdrop-blur sm:px-7 sm:py-6">
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-navy/45">Editar produto</p>
            <h2 id={titleId} className="truncate font-heading text-xl font-bold text-navy sm:text-2xl">
              {product.name}
            </h2>
            <p className="mt-1 text-sm text-ink/55">Atualize as informações exibidas no catálogo.</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={requestClose}
            aria-label="Fechar edição"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy/5 text-xl leading-none text-navy transition hover:bg-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="p-5 sm:p-7">
          <form action={updateAction} className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
            <input type="hidden" name="id" value={product.id} />

            <aside className="self-start rounded-[22px] bg-[#f0f1f6] p-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-navy/45">Imagem do produto</p>
              <ImageUploader current={product.imageUrl} />
              <p className="mt-4 text-xs leading-relaxed text-ink/50">
                Use JPEG, PNG, WebP ou AVIF com até 5 MB.
              </p>
            </aside>

            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-ink/60 sm:col-span-2">
                Nome
                <input name="name" defaultValue={product.name} className={fieldClassName} />
                <FieldError result={updateResult} name="name" />
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Código/SKU
                <input name="sku" defaultValue={product.sku} className={fieldClassName} />
                <FieldError result={updateResult} name="sku" />
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Marca
                <input name="brandName" defaultValue={product.brandName} className={fieldClassName} />
                <FieldError result={updateResult} name="brandName" />
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Preço (R$)
                <input
                  name="precoReais"
                  inputMode="decimal"
                  defaultValue={centsToReaisInput(product.priceCents)}
                  placeholder="Sob consulta"
                  className={fieldClassName}
                />
                <FieldError result={updateResult} name="precoReais" />
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Unidade
                <input name="unit" defaultValue={product.unit} className={fieldClassName} />
                <FieldError result={updateResult} name="unit" />
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Disponibilidade
                <select name="stockStatus" defaultValue={product.stockStatus} className={fieldClassName}>
                  <option value="available">Disponível</option>
                  <option value="on_request">Sob consulta</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Categoria
                <select name="categorySlug" defaultValue={product.categorySlug} className={fieldClassName}>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>{category.name}</option>
                  ))}
                </select>
              </label>

              <div className="sm:col-span-2">
                <ActionFeedback result={updateResult} />
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={requestClose}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy/5"
                >
                  Cancelar
                </button>
                <button
                  disabled={updating}
                  className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Salvando…" : "Salvar alterações"}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-7 border-t border-navy/10 pt-5">
            {confirmDelete ? (
              <div className="rounded-2xl border border-red/15 bg-red/5 p-4">
                <p className="text-sm font-semibold text-navy">Remover este produto?</p>
                <p className="mt-1 text-xs leading-relaxed text-ink/55">Esta ação retirará o item do catálogo.</p>
                <form action={deleteAction} className="mt-4 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={product.id} />
                  <button
                    disabled={deleting}
                    className="rounded-full bg-red px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {deleting ? "Removendo…" : "Sim, remover"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-navy hover:bg-white"
                  >
                    Manter produto
                  </button>
                </form>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="rounded-full px-4 py-2 text-xs font-semibold text-red transition hover:bg-red/5"
              >
                Remover produto
              </button>
            )}
            <ActionFeedback result={deleteResult} />
          </div>
        </div>
      </motion.section>
    </motion.div>,
    document.body
  );
}

export function ProductRow({ product, categories }: { product: Product; categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <article className="group self-start overflow-hidden rounded-2xl bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy/40"
      >
        <div className="aspect-[4/3] overflow-hidden bg-sky">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <span className="grid h-full place-items-center px-4 text-center text-sm font-semibold text-navy/45">
              Imagem em breve
            </span>
          )}
        </div>
        <h2 className="line-clamp-2 min-h-[4.5rem] px-4 py-4 font-heading text-base font-bold leading-snug text-navy">
          {product.name}
        </h2>
      </button>

      {open ? (
        <ProductEditDialog
          product={product}
          categories={categories}
          titleId={titleId}
          onClosed={() => setOpen(false)}
          triggerRef={triggerRef}
        />
      ) : null}
    </article>
  );
}
