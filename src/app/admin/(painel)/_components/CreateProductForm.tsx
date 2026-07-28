"use client";

import { createPortal } from "react-dom";
import { useActionState, useCallback, useEffect, useId, useRef, useState } from "react";
import type { Category } from "@/data/catalog";
import { INITIAL_ACTION_RESULT } from "@/lib/action-result";
import { createProductAction } from "@/app/admin/(painel)/produtos/actions";
import { ActionFeedback, FieldError } from "./ActionFeedback";
import { ImageUploader } from "./ImageUploader";

const fieldClassName =
  "mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-navy/40 focus:ring-4 focus:ring-navy/5";

export function CreateProductForm({ categories }: { categories: Category[] }) {
  const [result, action, pending] = useActionState(createProductAction, INITIAL_ACTION_RESULT);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);

  const closeModal = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
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
  }, [closeModal, open]);

  const modal = open ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#343342]/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <section
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="my-auto max-h-[calc(100vh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-[#fcfcfd] shadow-[0_28px_90px_rgba(25,26,38,0.32)] sm:max-h-[calc(100vh-3rem)]"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-navy/10 bg-[#fcfcfd]/95 px-5 py-5 backdrop-blur sm:px-7 sm:py-6">
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-navy/45">Novo item no catálogo</p>
            <h2 id={titleId} className="font-heading text-xl font-bold text-navy sm:text-2xl">
              Adicionar produto
            </h2>
            <p className="mt-1 text-sm text-ink/55">Preencha as informações que serão exibidas no catálogo.</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeModal}
            aria-label="Fechar cadastro"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy/5 text-xl leading-none text-navy transition hover:bg-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <form action={action} className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="self-start rounded-[22px] bg-[#f0f1f6] p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-navy/45">Imagem do produto</p>
            <ImageUploader />
            <p className="mt-4 text-xs leading-relaxed text-ink/50">
              Use JPEG, PNG, WebP ou AVIF com até 5 MB.
            </p>
          </aside>

          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-ink/60 sm:col-span-2">
              Nome
              <input name="name" required className={fieldClassName} />
              <FieldError result={result} name="name" />
            </label>
            <label className="text-xs font-semibold text-ink/60">
              Código/SKU
              <input name="sku" className={fieldClassName} />
              <FieldError result={result} name="sku" />
            </label>
            <label className="text-xs font-semibold text-ink/60">
              Marca
              <input name="brandName" className={fieldClassName} />
              <FieldError result={result} name="brandName" />
            </label>
            <label className="text-xs font-semibold text-ink/60">
              Preço (R$)
              <input name="precoReais" inputMode="decimal" placeholder="Sob consulta" className={fieldClassName} />
              <FieldError result={result} name="precoReais" />
            </label>
            <label className="text-xs font-semibold text-ink/60">
              Unidade
              <input name="unit" defaultValue="UN" className={fieldClassName} />
              <FieldError result={result} name="unit" />
            </label>
            <label className="text-xs font-semibold text-ink/60">
              Disponibilidade
              <select name="stockStatus" defaultValue="available" className={fieldClassName}>
                <option value="available">Disponível</option>
                <option value="on_request">Sob consulta</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-ink/60">
              Categoria
              <select name="categorySlug" className={fieldClassName}>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>{category.name}</option>
                ))}
              </select>
            </label>

            <div className="sm:col-span-2">
              <ActionFeedback result={result} />
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy/5"
              >
                Cancelar
              </button>
              <button
                disabled={pending}
                className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Adicionando…" : "Adicionar produto"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="rounded-full bg-red px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/35 focus-visible:ring-offset-2"
      >
        + Adicionar produto
      </button>

      {modal ? createPortal(modal, document.body) : null}
    </>
  );
}
