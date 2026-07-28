"use client";

import { useActionState, useState } from "react";
import { createBrandAction, deleteBrandAction } from "@/app/admin/(painel)/marcas/actions";
import { INITIAL_ACTION_RESULT } from "@/lib/action-result";
import { ActionFeedback, FieldError } from "./ActionFeedback";
import { ImageUploader } from "./ImageUploader";

export function CreateBrandForm() {
  const [result, action, pending] = useActionState(createBrandAction, INITIAL_ACTION_RESULT);
  return (
    <form action={action} className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <ImageUploader name="logo" />
      <label className="text-sm font-semibold text-ink/70">Nome
        <input name="name" required className="mt-1 rounded-lg border border-navy/15 px-3 py-2 text-sm" />
        <FieldError result={result} name="name" />
        <FieldError result={result} name="logo" />
      </label>
      <button disabled={pending} className="rounded-full bg-red px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {pending ? "Adicionando…" : "Adicionar"}
      </button>
      <div className="w-full"><ActionFeedback result={result} /></div>
    </form>
  );
}

export function DeleteBrandButton({ id }: { id: number }) {
  const [result, action, pending] = useActionState(deleteBrandAction, INITIAL_ACTION_RESULT);
  const [confirm, setConfirm] = useState(false);
  if (!confirm) {
    return <button type="button" onClick={() => setConfirm(true)} className="mt-2 rounded-full px-3 py-2 text-xs font-semibold text-red">Remover</button>;
  }
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} className="mt-2 rounded-full bg-red px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
        {pending ? "…" : "Confirmar"}
      </button>
      <button type="button" onClick={() => setConfirm(false)} className="mt-2 px-2 py-2 text-xs text-navy">Cancelar</button>
      <ActionFeedback result={result} />
    </form>
  );
}
