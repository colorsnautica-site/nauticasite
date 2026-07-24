"use client";
import { useState } from "react";
import type { Product, Category } from "@/data/catalog";
import { centsToReaisInput } from "@/lib/money";
import { ImageUploader } from "./ImageUploader";
import { updateProductAction, deleteProductAction } from "@/app/admin/(painel)/produtos/actions";

export function ProductRow({ product, categories }: { product: Product; categories: Category[] }) {
  const [saving, setSaving] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  return (
    <form
      action={async (fd) => { setSaving(true); try { await updateProductAction(fd); } finally { setSaving(false); } }}
      className="grid grid-cols-1 items-end gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_auto]"
    >
      <input type="hidden" name="id" value={product.id} />
      <ImageUploader current={product.imageUrl} />
      <label className="text-xs font-semibold text-ink/60">Nome
        <input name="name" defaultValue={product.name} className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm text-ink" />
      </label>
      <label className="text-xs font-semibold text-ink/60">Marca
        <input name="brandName" defaultValue={product.brandName} className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm text-ink" />
      </label>
      <label className="text-xs font-semibold text-ink/60">Preço (R$)
        <input name="precoReais" defaultValue={centsToReaisInput(product.priceCents)} placeholder="Sob consulta"
          className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm" />
      </label>
      <label className="text-xs font-semibold text-ink/60">Disponibilidade
        <select name="stockStatus" defaultValue={product.stockStatus} className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm">
          <option value="available">Disponível</option>
          <option value="on_request">Sob consulta</option>
        </select>
      </label>
      <label className="text-xs font-semibold text-ink/60">Categoria
        <select name="categorySlug" defaultValue={product.categorySlug} className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm">
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
          {saving ? "..." : "Salvar"}
        </button>
        {confirmar ? (
          <button formAction={deleteProductAction} className="rounded-full bg-red px-3 py-2 text-xs font-semibold text-white">Confirmar</button>
        ) : (
          <button type="button" onClick={() => setConfirmar(true)} className="rounded-full px-3 py-2 text-xs font-semibold text-red">Remover</button>
        )}
      </div>
    </form>
  );
}
