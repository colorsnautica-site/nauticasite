"use client";

import { useActionState } from "react";
import type { Category } from "@/data/catalog";
import { INITIAL_ACTION_RESULT } from "@/lib/action-result";
import { createProductAction } from "@/app/admin/(painel)/produtos/actions";
import { ActionFeedback, FieldError } from "./ActionFeedback";
import { ImageUploader } from "./ImageUploader";

export function CreateProductForm({ categories }: { categories: Category[] }) {
  const [result, action, pending] = useActionState(createProductAction, INITIAL_ACTION_RESULT);
  return (
    <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <ImageUploader />
      <label className="text-xs font-semibold text-ink/60">Nome
        <input name="name" required className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
        <FieldError result={result} name="name" />
      </label>
      <label className="text-xs font-semibold text-ink/60">Código/SKU
        <input name="sku" className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
        <FieldError result={result} name="sku" />
      </label>
      <label className="text-xs font-semibold text-ink/60">Marca
        <input name="brandName" className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
        <FieldError result={result} name="brandName" />
      </label>
      <label className="text-xs font-semibold text-ink/60">Preço (R$)
        <input name="precoReais" inputMode="decimal" placeholder="Sob consulta" className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
        <FieldError result={result} name="precoReais" />
      </label>
      <label className="text-xs font-semibold text-ink/60">Unidade
        <input name="unit" defaultValue="UN" className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
        <FieldError result={result} name="unit" />
      </label>
      <label className="text-xs font-semibold text-ink/60">Disponibilidade
        <select name="stockStatus" defaultValue="available" className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm">
          <option value="available">Disponível</option>
          <option value="on_request">Sob consulta</option>
        </select>
      </label>
      <label className="text-xs font-semibold text-ink/60">Categoria
        <select name="categorySlug" className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm">
          {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
        </select>
      </label>
      <div className="sm:col-span-2 lg:col-span-4">
        <button disabled={pending} className="rounded-full bg-red px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {pending ? "Adicionando…" : "Adicionar"}
        </button>
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}
