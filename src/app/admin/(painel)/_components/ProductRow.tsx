"use client";

import { useActionState, useState } from "react";
import type { Category, Product } from "@/data/catalog";
import { INITIAL_ACTION_RESULT } from "@/lib/action-result";
import { centsToReaisInput } from "@/lib/money";
import { deleteProductAction, updateProductAction } from "@/app/admin/(painel)/produtos/actions";
import { ActionFeedback, FieldError } from "./ActionFeedback";
import { ImageUploader } from "./ImageUploader";

export function ProductRow({ product, categories }: { product: Product; categories: Category[] }) {
  const [updateResult, updateAction, updating] = useActionState(updateProductAction, INITIAL_ACTION_RESULT);
  const [deleteResult, deleteAction, deleting] = useActionState(deleteProductAction, INITIAL_ACTION_RESULT);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <details className="group self-start overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow open:shadow-soft">
      <summary className="cursor-pointer list-none outline-none focus-visible:ring-2 focus-visible:ring-navy/40 [&::-webkit-details-marker]:hidden">
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
      </summary>

      <div className="border-t border-navy/10 p-4">
        <form action={updateAction} className="grid grid-cols-1 gap-3">
          <input type="hidden" name="id" value={product.id} />
          <ImageUploader current={product.imageUrl} />
          <label className="text-xs font-semibold text-ink/60">Nome
            <input name="name" defaultValue={product.name} className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm text-ink" />
            <FieldError result={updateResult} name="name" />
          </label>
          <label className="text-xs font-semibold text-ink/60">Código/SKU
            <input name="sku" defaultValue={product.sku} className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm text-ink" />
            <FieldError result={updateResult} name="sku" />
          </label>
          <label className="text-xs font-semibold text-ink/60">Marca
            <input name="brandName" defaultValue={product.brandName} className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm text-ink" />
            <FieldError result={updateResult} name="brandName" />
          </label>
          <label className="text-xs font-semibold text-ink/60">Preço (R$)
            <input name="precoReais" inputMode="decimal" defaultValue={centsToReaisInput(product.priceCents)} placeholder="Sob consulta" className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
            <FieldError result={updateResult} name="precoReais" />
          </label>
          <label className="text-xs font-semibold text-ink/60">Unidade
            <input name="unit" defaultValue={product.unit} className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
            <FieldError result={updateResult} name="unit" />
          </label>
          <label className="text-xs font-semibold text-ink/60">Disponibilidade
            <select name="stockStatus" defaultValue={product.stockStatus} className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm">
              <option value="available">Disponível</option>
              <option value="on_request">Sob consulta</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-ink/60">Categoria
            <select name="categorySlug" defaultValue={product.categorySlug} className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm">
              {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
            </select>
          </label>
          <button disabled={updating} className="w-fit rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
            {updating ? "Salvando…" : "Salvar"}
          </button>
          <ActionFeedback result={updateResult} />
        </form>

        <div className="mt-4 border-t border-navy/10 pt-3">
          {confirmDelete ? (
            <form action={deleteAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={product.id} />
              <span className="w-full text-xs text-ink/60">Confirma a remoção?</span>
              <button disabled={deleting} className="rounded-full bg-red px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                {deleting ? "Removendo…" : "Confirmar"}
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="px-3 py-2 text-xs font-semibold text-navy">Cancelar</button>
            </form>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-full px-3 py-2 text-xs font-semibold text-red">Remover</button>
          )}
          <ActionFeedback result={deleteResult} />
        </div>
      </div>
    </details>
  );
}
