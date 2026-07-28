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
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <form action={updateAction} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        <div>
          <button disabled={updating} className="rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
            {updating ? "Salvando…" : "Salvar"}
          </button>
        </div>
        <div className="sm:col-span-2 lg:col-span-4"><ActionFeedback result={updateResult} /></div>
      </form>

      <div className="mt-3 border-t border-navy/10 pt-3">
        {confirmDelete ? (
          <form action={deleteAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={product.id} />
            <span className="text-xs text-ink/60">Confirma a remoção?</span>
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
    </article>
  );
}
